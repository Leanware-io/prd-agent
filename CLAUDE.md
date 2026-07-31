# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

A monorepo with two independently deployed packages. There is **no workspace tooling** tying them together — no root `package.json`, no Nx/Turbo/Lerna. Each package has its own dependencies, lint config, and deploy pipeline. Always `cd` into the package you are working on before running anything.

- `prd-agent-backend/` — Django 5 REST API (Python 3.11)
- `prd-agent-backend/agents/` — Google ADK agent system, a **separate Cloud Run service** with its own `requirements.txt`
- `prd-agent-frontend/` — React 18 + TypeScript + Vite SPA

Read [README.md](README.md) for the architecture and request flow.

## Commands

```bash
# ── Backend (from prd-agent-backend/) ────────────────────────────────
python manage.py runserver
python manage.py migrate
python manage.py makemigrations
pytest                        # single test: pytest path/to/test.py::TestClass::test_name
pytest -s                     # with stdout, for debugging

# Lint — run all four before considering backend work done
autoflake --check-diff --remove-all-unused-imports --remove-unused-variables \
  --recursive --exclude env,venv,migrations,__init__.py .
isort . --skip migrations --profile black
black . --exclude "migrations|__init__.py"
pylint --recursive y api --ignore=migrations --disable=missing-docstring
pylint --recursive y prd_agent --ignore=migrations --disable=missing-docstring

# ── Agents (from prd-agent-backend/agents/) ──────────────────────────
adk web .                     # local dev UI for the agent system

# ── Frontend (from prd-agent-frontend/) ──────────────────────────────
yarn dev
yarn build
yarn ci                       # circular deps + types + eslint + stylelint + tests
yarn test                     # single file: yarn test path/to/file.test.tsx
yarn lint                     # eslint --fix
yarn check-types              # tsc --noEmit
yarn check-structure          # steiger — enforces Feature-Sliced Design layers
```

`scripts/lint.sh` (backend) and `scripts/code-quality.sh` (frontend) bundle these, with `.bat` equivalents for Windows.

## Conventions

### Backend

- **Formatting is enforced, not advisory.** black + isort with the black profile. CI fails on a diff. `migrations/` and `__init__.py` are excluded from both.
- Pylint runs with `missing-docstring` disabled, but module-level docstrings are the existing style throughout `api/` and `prd_agent/` — follow it.
- Config is read via `os.getenv` in `prd_agent/settings.py` and re-exported as module constants. Add new settings there rather than calling `os.getenv` deep in application code.
- Django apps live under `api/` (`users`, `chats`, `business`). `business` is scaffolded but **not wired into the URLconf** — its include is commented out in `prd_agent/urls.py`.
- The custom user model is `users.User` (`AUTH_USER_MODEL`). Auth is Firebase ID token verification in `api/users/authentication.py`, not Django sessions.
- `prd-agent-backend/app/` is **dead code** from the pre-Django Flask version. It contains only stale `.pyc` files and is gitignored. Don't reference it; the live code is `api/` + `prd_agent/`.

### Agents

- Each sub-agent is a directory under `agents/sub_agents/` with `agent.py` (the `Agent` definition) and `prompt.py` (its instruction strings). Keep prompt text in `prompt.py`, not inline in `agent.py`.
- `agents/requirements.txt` pins `google-adk` **separately and to a different version** than the backend's `requirements.txt`. Changing one does not change the other, and they deploy independently.
- `agents/agent.py` uses private ADK internals (`callback_context._invocation_context`). This is fragile across ADK upgrades — if you bump `google-adk`, exercise the `.generate_markdown` path specifically.
- The literal user message `.generate_markdown` is a control sentinel that forces routing to the markdown generator. Don't treat it as ordinary user input.
- **Never hardcode rates, prices, or monetary amounts in a prompt.** The quoting agent's pricing lives in a rate card loaded by `sub_agents/quote/rate_card.py` from `QUOTE_RATE_CARD_PATH`, falling back to the placeholder `rate_card.example.json`. `prompt.py` holds `_QUOTING_PROMPT_TEMPLATE` with `{{RATE_TABLE}}`, `{{COMPLEXITY_TABLE}}`, `{{MANAGED_PREMIUM_PCT}}` and `{{HOURS_PER_MONTH}}` tokens, filled by `build_quoting_prompt()`. Add new pricing inputs to the card and a token, not to the prompt text.
- The worked examples in the quoting prompt intentionally show `<computed from rate table>` instead of figures, so the model cannot anchor on stale numbers. Keep them that way.

### Frontend

- **Feature-Sliced Design.** Layers are `app` → `pages` → `widgets` → `features` → `shared`. A layer may only import from layers *below* it. `yarn check-structure` and `yarn check-circular` enforce this and run in `yarn ci`.
- Every slice exposes a public API through an `index.ts` barrel. Import from the slice root (`@/features/chat`), not from internal paths.
- Imports are auto-sorted by `eslint-plugin-sort-imports-es6-autofix`; TypeScript interface and enum keys are alphabetised by `eslint-plugin-typescript-sort-keys`. Let the linter do it rather than hand-ordering.
- Prettier uses `trailingComma: "all"`. Styling is Tailwind, with CSS Modules only where Tailwind is insufficient (see `features/chat/ui/quote-artifact/styles.module.css`).
- Env vars are accessed only through `src/shared/config/environment.ts` — never `import.meta.env` elsewhere.
- Tests are Jest + React Testing Library. Non-JS assets and heavy deps (`three`, `react-markdown`, `react-resizable-panels`) are mocked in `__mocks__/`; add a mock there when introducing a similar dependency.

## Secrets

This repository is **public**. Before committing:

- Never commit `.env`, `credentials.json`, service account JSON, or any private key. The root `.gitignore` and each package's own `.gitignore` both guard against this — do not weaken those patterns.
- Only `.env-example` (backend) and `.env-sample` (frontend) are tracked, and they contain placeholders only.
- Anything prefixed `VITE_` is compiled into the public client bundle. Never put a server-side secret behind that prefix.
- GitHub Actions read credentials from Environment Secrets and Variables. Reference them as `${{ secrets.X }}` / `${{ vars.X }}`; never inline a value.
- The backend `pre-commit` config includes a `detect-private-key` hook. Run `pre-commit install` when working on the backend.

## CI/CD

Workflows live in **`.github/workflows/` at the repository root**. GitHub only executes workflows from the root, so per-package `.github/` directories would be inert — do not move them back into the packages.

Each workflow is scoped with `paths:` filters and sets a `working-directory`, so a backend change does not trigger a frontend build. **If you add a top-level directory that a package depends on, update the corresponding `paths:` filter** or CI will silently skip it.

Naming convention: `<package>-<purpose>.yml` (`backend-ci.yml`, `frontend-deploy-staging.yml`, …).

Because the repo is public, be deliberate about workflow triggers. `pull_request` from a fork gets **no** access to secrets; `workflow_run` and `issue_comment` run in the base-repo context and **do** have secret access — never let either execute code from a pull request head.

## Gotchas

- **Backend tests do not run in CI.** The `pytest` step in `backend-ci.yml` is commented out. Run `pytest` locally; don't assume a green pipeline means tests passed.
- `SQLALCHEMY_DATABASE_URI` is a leftover name from the Flask era. It configures Django's `DATABASES`, parsed with `urllib.parse` in `settings.py`. It is not SQLAlchemy.
- The Django admin is mounted at a deliberately non-obvious path, not `/admin/`. See `prd_agent/urls.py`.
- `ALLOWED_HOSTS` is `[]` in `settings.py`, which only works because Cloud Run terminates at the proxy. Set it explicitly if you change the hosting model.
- `CORS_ALLOWED_ORIGINS` is a hardcoded list in `settings.py`. New frontend origins must be added there.
- WeasyPrint (PDF generation) needs native system libraries — pango, cairo, gdk-pixbuf — and `prd_agent/utils/tools.py` imports it at module level. The `Dockerfile` is `python:3.11-slim` and installs **no** system packages, so that import will fail in the container unless the libraries are added via `apt-get`. On macOS: `brew install pango gdk-pixbuf libffi`.
- Local backend development against Cloud SQL requires your public IP allowlisted on the instance.
