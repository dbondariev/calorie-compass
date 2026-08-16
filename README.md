# Calorie Compass

A full-stack calorie and macro calculator built as a small commercial-style
monorepo. The React app communicates only with a Backend-for-Frontend (BFF),
which validates the shared contract before calling the Flask service.

## Architecture

```text
Browser (React + MUI)
       │ /api
       ▼
BFF (Express + TypeScript + Ajv)
       │ /api/v1
       ▼
Flask API (Pydantic + SQLAlchemy)
       │
       ▼
SQLite locally / PostgreSQL when deployed
```

```text
calories calculator/
├── frontend/              React 19, TypeScript, Vite, MUI, Zod
│   └── src/
│       ├── components/    Form, result and history UI
│       ├── schemas/       Browser form validation
│       ├── services/      BFF API client
│       └── types/         Frontend domain types
├── bff/                   Express boundary and JSON Schema validation
│   └── src/
├── backend/               Flask application-factory architecture
│   ├── app/
│   │   ├── models/        SQLAlchemy persistence models
│   │   └── services/      OOP calculation domain
│   └── tests/
└── contracts/
    ├── api/               OpenAPI 3.1 contract
    └── schema/            Shared JSON Schemas
```

## Run locally

Requirements: Node.js 20+ and Python 3.12+.

The dependencies and Python virtual environment are already installed in this
workspace. Start all three services from the project root:

```bash
npm run dev
```

Open <http://localhost:5173>. The BFF runs on port `3001`; Flask runs on port
`5001`. Vite proxies browser `/api` calls to the BFF.

For production-style database setup, disable automatic local schema creation
and apply the committed migration:

```bash
cd backend
AUTO_CREATE_SCHEMA=false .venv/bin/flask --app app:create_app db upgrade
```

For a clean installation:

```bash
npm install
python3 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements.txt
```

## Quality checks

```bash
npm run build
npm run test
npm run lint
```

## Deploy

The root `render.yaml` defines the complete public environment:

- one public Node service that serves the React build and BFF;
- one Flask service reached by the BFF over Render's private network;
- one PostgreSQL database reachable only by Flask;
- automatic database migrations and deploys from `main`.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/dbondariev/calorie-compass)

Render's free web services are suitable for a portfolio/demo deployment and
can sleep when idle. Its free PostgreSQL database expires after 30 days, so use
a paid database plan for a permanent public service.

Validation is intentionally layered:

1. React Hook Form + Zod gives immediate field-level feedback.
2. Ajv validates the shared JSON Schema at the BFF trust boundary.
3. Pydantic validates again inside Flask before domain logic runs.
4. SQLAlchemy enforces persistence types and required fields.

Errors are handled at system boundaries: the UI translates network, timeout,
validation, and deletion failures into recoverable feedback; the BFF returns
safe JSON for malformed requests, timeouts, invalid backend responses, and
network failures; Flask converts HTTP, validation, persistence, and unexpected
exceptions into structured JSON and rolls back failed transactions.

## Python topic map

- Data types, collections, control flow and loops: calculator rules and mappings.
- Functions, modules and packages: application factory and layered packages.
- OOP and inheritance: `CalorieCalculator` and `MifflinStJeorCalculator`.
- Exception handling: `ApiError`, Pydantic validation and Flask handlers.
- Flask/networking: versioned REST API routes.
- SQLAlchemy: persisted calculation history.
- Decorators and generators: timed service decorator and macro generator.
- JSON, files and unit testing: API payloads, contracts and Pytest suite.

PyGame and Tkinter are desktop-GUI technologies, so they are deliberately not
mixed into this browser-based application. NumPy/Pandas would add unnecessary
weight for a calculation that is clearer with standard Python arithmetic.

## Calculation notes

The service uses the Mifflin–St Jeor BMR equation, activity multipliers, and a
modest goal adjustment. Results are educational estimates and are not medical
advice.
