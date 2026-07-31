# PRD Agent

An AI agent that turns a conversation into a software Product Requirements Document and a costed project quote.

A prospective client describes what they want to build in a chat interface. A coordinator agent routes the conversation to specialist sub-agents that interview the user, draft a structured PRD, estimate the work, and produce a downloadable PDF quote — with an option to book a discovery call at the end.

This monorepo contains both halves of the system:

| Package | Stack | Role |
| --- | --- | --- |
| [`prd-agent-backend/`](prd-agent-backend) | Django 5 + DRF, Python 3.11 | REST API, session/persistence layer, PDF generation, notifications |
| [`prd-agent-backend/agents/`](prd-agent-backend/agents) | Google ADK, Gemini | The multi-agent system itself, deployed as a separate service |
| [`prd-agent-frontend/`](prd-agent-frontend) | React 18 + TypeScript, Vite, Tailwind | Chat UI, Firebase auth, quote artifact viewer |

## How it works

```
Browser (React)
      │  Firebase ID token
      ▼
Django REST API ──────────► Cloud SQL (Postgres)   sessions, messages, users
      │                └──► Cloud Storage          generated PRD/quote PDFs
      │                └──► SendGrid / Slack       "new lead" notifications
      │  HTTP
      ▼
Agent service (Google ADK on Cloud Run)
      │
      ├── coordinator ─────► routes by intent
      │     ├── prd_agent          interviews the user, drafts the PRD
      │     └── quote_agent        builds the estimate and rate breakdown
      └── markdown_generator       renders the final artifact
```

The coordinator is wrapped in a `SequentialAgent` with a `before_agent_callback`. That callback intercepts the sentinel message `.generate_markdown` and short-circuits directly to the markdown generator — the PRD agent otherwise tries to render markdown itself, and this forces a clean hand-off. See `prd-agent-backend/agents/agent.py`.

### Backend API surface

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/session` | Create a chat session |
| `POST` | `/api/chat/<session_key>` | Send a message, stream the agent reply |
| `GET` | `/api/download/quote/<session_key>` | Download the generated quote PDF |
| `POST` | `/api/schedule-call/<session_key>` | Request a discovery call |
| `GET` | `/api/health/db` | Database health check |

## Getting started

### Prerequisites

- Python 3.11
- Node.js 22 and Yarn
- A Postgres database (local or Cloud SQL)
- A Google Cloud project with Vertex AI / Gemini access, and a Firebase web app for auth

### Backend

```bash
cd prd-agent-backend

python -m venv venv
source venv/bin/activate            # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r test-requirements.txt

cp .env-example .env                # then fill it in — see below
python manage.py migrate
python manage.py runserver
```

### Agent service

The agents are a separate deployable. Run them locally with the ADK dev UI:

```bash
cd prd-agent-backend/agents
pip install -r requirements.txt
adk web .
```

Point the backend at it with `AI_SERVICE_URL`.

### Frontend

```bash
cd prd-agent-frontend

yarn install
cp .env-sample .env                 # then fill it in
yarn dev
```

## Configuration

Neither package ships real credentials. Copy the example file in each and populate it.

**`prd-agent-backend/.env`** — see [`.env-example`](prd-agent-backend/.env-example)

| Variable | Notes |
| --- | --- |
| `SECRET_KEY` | Django secret key |
| `SQLALCHEMY_DATABASE_URI` | Postgres connection URL |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to a service account JSON file |
| `GOOGLE_CLOUD_PROJECT` | GCP project ID |
| `AI_SERVICE_URL` / `AI_APP_NAME` | Where the ADK agent service is reachable |
| `MODEL` | Gemini model ID, defaults to `gemini-2.5-pro` |
| `QUOTE_RATE_CARD_PATH` | Optional. JSON rate card for the quoting agent — see below |
| `PRD_BUCKET` | Cloud Storage bucket for generated PDFs |
| `SESSIONS_SECRET_KEY` | Signs session keys |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` | Optional, for alternative model backends |
| `SENDGRID_API_KEY` / `EMAIL_SENDER` / `TEAM_EMAIL` | Lead notification email |
| `SLACK_BOT_TOKEN` / `SLACK_CHANNEL_ID` | Lead notification Slack |
| `SENTRY_DSN` / `ENVIRONMENT` | Error reporting |
| `APP_DEBUG` | `True` enables Django debug mode — never in production |

**`prd-agent-frontend/.env`** — see [`.env-sample`](prd-agent-frontend/.env-sample)

`VITE_API_URL`, the `VITE_FIREBASE_*` web app config, `VITE_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `VITE_GTAG_ID`, `VITE_GTAG_CONVERSION_ID`, `VITE_NEXT_ENV`.

> Vite inlines every `VITE_`-prefixed variable into the client bundle. Treat all of them as public — never put a server-side secret behind that prefix.

### Rate card

The quoting agent prices work from a rate card that is **not** part of this repository. It loads the JSON file named by `QUOTE_RATE_CARD_PATH`; when that variable is unset it falls back to [`rate_card.example.json`](prd-agent-backend/agents/sub_agents/quote/rate_card.example.json), which holds deliberately fictional placeholder figures so the agent still runs.

Quotes produced with the placeholder card are not real pricing, and the agent is instructed to present them as indicative only. To use real rates, write a file with the same shape and point `QUOTE_RATE_CARD_PATH` at it.

## Development

Both packages are linted in CI and the same commands run locally.

```bash
# Backend — from prd-agent-backend/
black . --exclude "migrations|__init__.py"
isort . --skip migrations --profile black
pylint --recursive y api prd_agent --ignore=migrations --disable=missing-docstring
pytest

# Frontend — from prd-agent-frontend/
yarn ci            # circular deps, types, eslint, stylelint, tests + coverage
yarn lint          # eslint --fix
yarn test
```

The backend also has a `pre-commit` config — `pre-commit install` to enable it.

### Frontend architecture

The frontend follows [Feature-Sliced Design](https://feature-sliced.design/): `app` → `pages` → `widgets` → `features` → `shared`, where a layer may only import from layers below it. `yarn check-structure` (steiger) and `yarn check-circular` (madge) enforce this.

## Deployment

Both services deploy to Google Cloud from GitHub Actions in [`.github/workflows/`](.github/workflows). Workflows are path-filtered, so a backend-only change does not rebuild the frontend.

- **Backend** → container image to Artifact Registry, then Cloud Run
- **Agents** → Cloud Run via `adk deploy cloud_run`
- **Frontend** → static build to Firebase Hosting

Staging deploys on merge to `main`; production deploys on a published release or manual dispatch. Configuration comes from GitHub Environments (`staging`, `production`) as Variables and Secrets — see the `env:` block of each workflow for the full list.

## Repository layout

```
.
├── .github/workflows/        CI and deployment for both packages
├── prd-agent-backend/
│   ├── agents/               Google ADK multi-agent system
│   │   ├── agent.py          coordinator + sequential wrapper
│   │   └── sub_agents/       prd, quote, markdown_generator
│   ├── api/                  Django apps: users, chats, business
│   ├── prd_agent/            project settings, middleware, utils, templates
│   └── Dockerfile
└── prd-agent-frontend/
    ├── src/app/              entrypoint, providers, global styles
    ├── src/pages/            route-level screens
    ├── src/widgets/          composed UI blocks
    ├── src/features/         chat feature slices
    └── src/shared/           api clients, config, ui kit, utils
```

## License

[MIT](LICENSE) © Leanware
