# OpenOrbit Chatbot Development Guidelines (`gemini.md`)

Welcome! This document provides the core rules, architectural principles, and coding standards to follow when building, refactoring, or extending the **OpenOrbit Chatbot** application.

---

## 🛠️ Tech Stack & Key Technologies

### Backend (Python)
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Asynchronous python web framework)
- **Database ORM:** [SQLAlchemy](https://www.sqlalchemy.org/) (Async queries with SQLite `chat.db` for storage)
- **ASGI Server:** [Uvicorn](https://www.uvicorn.org/)
- **LLM Integration:** Custom providers (e.g., Groq, Ollama) selected via a provider factory
- **Caching:** Memory-based cache framework (`app/cache/memory_cache.py`)

### Frontend (React)
- **Build Tool:** [Vite](https://vitejs.dev/) (React + Javascript)
- **Styling:** Vanilla CSS (`index.css`, `App.css`, component-specific styles)
- **Build and Deployment:** ESLint, Vercel configuration (`vercel.json`)

---

## 📁 Repository Structure

Ensure any new code is placed in its correct module:

```
openorbit-chatbot/
├── backend/
│   ├── app/
│   │   ├── api/             # API Router definitions (chat, auth, stream, etc.)
│   │   ├── db/              # Database models, schemas, and sessions
│   │   ├── repositories/    # Decoupled database data access layers (Repository pattern)
│   │   ├── services/        # Third-party integrations (Groq, Ollama)
│   │   ├── chat/            # Chat services & Business logic
│   │   ├── cache/           # Caching mechanisms
│   │   └── core/            # Configuration and security settings
│   ├── main.py              # Application entrypoint
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React UI elements (Sidebar, MessageInput, etc.)
│   │   ├── pages/           # Page layouts (ChatPage, LoginPage, SignupPage)
│   │   ├── services/        # API client code and services
│   │   ├── hooks/           # Custom React hooks
│   │   └── index.css / App.css
│   └── package.json
```

---

## 🔑 Core Architecture Rules

### 1. Maintain the Repository Pattern
*   **Do not** make direct SQLAlchemy database queries (`select`, `insert`, `delete`) inside the API routes or service layers.
*   **Do** write all database queries inside repository classes in `backend/app/repositories/` (e.g., `MessageRepository`, `SessionRepository`). 
*   Instantiate and use these repositories inside `ChatService` or API routes to access data.

### 2. Strict Asynchronous DB Operations
*   All database interactions must be async.
*   Always use `async with AsyncSessionLocal() as session:` blocks within the repository functions to manage database sessions safely.

### 3. Clear Separation of Concerns
*   **API Routes (`app/api/`)** are responsible for endpoint definition, parsing requests, checking credentials, and executing services.
*   **Services (`app/services/` or `app/chat/`)** orchestrate business operations, stream LLM generation, coordinate caching, and perform high-level workflows.
*   **Repositories (`app/repositories/`)** handle data query generation and persistence.

---

## 💻 Backend Coding Standards (Python)

*   **Type Hinting:** Always provide type hints for function arguments and return types.
*   **Error Handling:** Throw standard `HTTPException` exceptions with appropriate HTTP status codes (e.g., `404 Not Found`, `403 Access Denied`, `400 Bad Request`) instead of custom dictionary errors.
*   **Imports:** Always use absolute imports relative to the `app` root directory (e.g., `from app.db.models import Message`).
*   **Model Syncing:** Any changes to table schema must be defined in `app/db/models.py`.

---

## 🎨 Frontend Coding Standards (React & CSS)

*   **Modular Component Design:** Keep UI components focused and reusable. Large layouts should be split into smaller subcomponents (e.g., `Sidebar`, `ChatWindow`, `MessageBubble`).
*   **CSS Guidelines:** Prefer Vanilla CSS. Rely on root CSS custom properties defined in `frontend/src/index.css` for consistent colors, transitions, and sizing. Do not use TailwindCSS unless explicitly instructed by the user.
*   **State Management:** Leverage React Context or clean custom hooks where state needs sharing. Use state hooks locally within components when they do not require global persistence.

---

## 🤖 AI Agent Implementation Rules (For Gemini / Antigravity)

*   **No Placeholders:** Never use placeholders, truncated code snippets, or comments like `// TODO: implement later`. Write out complete, production-ready code blocks.
*   **Safety & Clean-up:** Ensure imports are cleaned up, unused variables are deleted, and no secrets or private keys are hardcoded.
*   **Verification:** Verify changes against existing routing constraints and schemas. Always check the API endpoints in both backend and frontend to prevent contract breakage.
