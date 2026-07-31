# PRD Agent — Backend

Django 5 REST API for the PRD Agent, plus the Google ADK agent system under
[`agents/`](agents). Deployed to Cloud Run with Postgres on Cloud SQL.

See the [root README](../README.md) for the overall architecture, the request
flow, and setup covering both packages. This file covers backend specifics only.

## Quick start

```bash
python -m venv venv
source venv/bin/activate            # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r test-requirements.txt

cp .env-example .env                # then fill it in
python manage.py migrate
python manage.py runserver
```

Local development against Cloud SQL requires your public IP allowlisted on the
instance.

## Layout

| Path | Contents |
| --- | --- |
| `api/users/` | Custom user model, Firebase token authentication, quote download, call scheduling, health check |
| `api/chats/` | Chat sessions, messages, agent invocation |
| `api/business/` | Scaffolded, not yet wired into the URLconf |
| `prd_agent/` | Settings, middleware, WSGI/ASGI, PDF templates, GCS/Slack/SendGrid utils |
| `agents/` | ADK coordinator and sub-agents — a **separate** Cloud Run service with its own `requirements.txt` |

## Agents

The agent system deploys independently of the API. Run it locally with the ADK
dev UI and point the API at it via `AI_SERVICE_URL`:

```bash
cd agents
pip install -r requirements.txt
adk web .
```

The quoting agent's rates are **not** in this repository. They load from the JSON
file named by `QUOTE_RATE_CARD_PATH`, falling back to the placeholder figures in
`agents/sub_agents/quote/rate_card.example.json`. Quotes generated with the
placeholder card are not real pricing.

## Testing

```bash
pytest                              # pytest -s to see stdout
coverage run -m pytest && coverage report && coverage html
```

The `pytest` step is currently commented out in CI — run it locally.

## Code quality

Formatting is enforced in CI and fails on a diff:

```bash
autoflake --check-diff --remove-all-unused-imports --remove-unused-variables \
  --recursive --exclude env,venv,migrations,__init__.py .
isort . --skip migrations --profile black
black . --exclude "migrations|__init__.py"
pylint --recursive y api --ignore=migrations --disable=missing-docstring
pylint --recursive y prd_agent --ignore=migrations --disable=missing-docstring
```

`scripts/lint.sh` (and `scripts/lint.bat`) bundle these. `pre-commit install`
enables the hooks in `.pre-commit-config.yaml`, including `detect-private-key`.

## Environments

Staging and production deploy from GitHub Actions in the repository root
[`.github/workflows/`](../.github/workflows). Configuration comes from GitHub
Environment Variables and Secrets — see the `env:` block of each workflow for the
full list, and `.env-example` for what a local `.env` needs.
