"""Rate card loading and rendering for the quoting agent.

Commercial rates are deliberately **not** committed to this repository. The card
is loaded from the JSON file named by the ``QUOTE_RATE_CARD_PATH`` environment
variable. When that variable is unset, ``rate_card.example.json`` is used
instead: it holds obviously-fictional placeholder figures so the agent stays
runnable for local development and tests.

To supply the real card in a deployed environment, mount or write the JSON file
and point ``QUOTE_RATE_CARD_PATH`` at it. Its shape must match the example file.
"""

import json
import logging
import os
from pathlib import Path

logger = logging.getLogger(__name__)

_EXAMPLE_CARD_PATH = Path(__file__).parent / "rate_card.example.json"

# Fallback used only if the example file is missing or unreadable, so that an
# import failure here can never take down the agent service.
_MINIMAL_CARD = {
    "currency": "USD",
    "managed_premium_pct": 0,
    "hours_per_month": 160,
    "is_placeholder": True,
    "roles": [],
}


def load_rate_card(path: str | None = None) -> dict:
    """Return the rate card as a dict.

    Resolution order: the ``path`` argument, then ``QUOTE_RATE_CARD_PATH``, then
    the committed placeholder example.
    """
    candidate = path or os.getenv("QUOTE_RATE_CARD_PATH")

    if candidate:
        try:
            with open(candidate, encoding="utf-8") as handle:
                card = json.load(handle)
            card.setdefault("is_placeholder", False)
            return card
        except (OSError, json.JSONDecodeError):
            logger.warning(
                "Could not read rate card at %s; falling back to placeholder rates. "
                "Quotes generated now are NOT based on real commercial rates.",
                candidate,
            )
    else:
        logger.info(
            "QUOTE_RATE_CARD_PATH is not set; using placeholder rates from %s.",
            _EXAMPLE_CARD_PATH.name,
        )

    try:
        with open(_EXAMPLE_CARD_PATH, encoding="utf-8") as handle:
            return json.load(handle)
    except (OSError, json.JSONDecodeError):
        logger.error("Placeholder rate card at %s is unusable.", _EXAMPLE_CARD_PATH)
        return dict(_MINIMAL_CARD)


def render_rate_table(card: dict) -> str:
    """Render the rate card as the markdown table the prompt embeds."""
    premium = card.get("managed_premium_pct", 0)
    currency = card.get("currency", "USD")
    symbol = "$" if currency == "USD" else f"{currency} "

    lines = [
        f"| Role | User-Managed Rate | Managed Rate ({premium}% additional) |",
        "|------|-------------------|--------------------------------------|",
    ]

    for role in card.get("roles", []):
        name = role.get("role", "Unknown")

        if role.get("included_in_premium"):
            lines.append(f"| {name} | Included in premium | Included |")
            continue

        low = role.get("min_hourly")
        high = role.get("max_hourly")
        if low is None or high is None:
            continue

        factor = 1 + premium / 100
        managed_low = round(low * factor)
        managed_high = round(high * factor)
        lines.append(
            f"| {name} | {symbol}{low}-{high}/h "
            f"| {symbol}{managed_low}-{managed_high}/h |"
        )

    if card.get("is_placeholder"):
        lines.append("")
        lines.append(
            "> These are placeholder figures, not Leanware's commercial rates. "
            "Present any quote derived from them as indicative only, and state "
            "that final pricing requires confirmation from the Leanware team."
        )

    return "\n".join(lines)


def render_complexity_table(card: dict) -> str:
    """Render the complexity-to-hours estimation table."""
    bands = card.get("complexity_bands", [])
    if not bands:
        return "_No complexity bands configured._"

    lines = [
        "| Complexity | Description | Hour Range (approx.) |",
        "|------------|-------------|----------------------|",
    ]
    for band in bands:
        lines.append(
            f"| {band.get('level', '')} | {band.get('description', '')} "
            f"| {band.get('hours', '')} |"
        )
    return "\n".join(lines)
