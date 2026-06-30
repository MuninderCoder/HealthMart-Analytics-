# Contributing to HealthMart Analytics

We welcome contributions from the open-source community! To ensure a high code quality standard, please review the following guidelines.

## 🛠️ Development Guidelines

1. **Tech Stack Standards**:
   - **Frontend**: React 19, Tailwind CSS, Recharts, Framer Motion, Axios.
   - **Backend**: FastAPI (Python 3.11), Pandas.
   - **Mining Core**: Standard C++14. Ensure code compiles with GCC 6.3.0+ without structured bindings or C++17 library headers.

2. **Branching & Commit Rules**:
   - Work should be done on feature branches based off `main` (e.g., `feature/analytics-graphs` or `bugfix/auth-token-refresh`).
   - Write clear, declarative commit messages using semantic prefixes:
     - `feat:` for new capabilities.
     - `fix:` for bug fixes.
     - `docs:` for documentation updates.
     - `test:` for adding or modifying tests.

3. **Coding Conventions**:
   - **Python**: Follow PEP 8 style formatting.
   - **JavaScript/React**: Organize code into functional, reusable components and custom hooks. Avoid inline mock states where REST API sync is expected.
   - **C++**: Follow clean object-oriented class design. Run existing unit tests before committing changes.

## 🧪 Testing Requirements

Ensure all test runners pass successfully before submitting a Pull Request:
- **C++ Core**: Run `make test` or compile and execute `run_tests` in `backend/algorithm/cpp/`.
- **Frontend Build**: Verify there are no typescript/es build warnings by compiling:
  ```bash
  npm run build --prefix frontend
  ```
- **Docker Compose Validation**: Ensure backend and frontend containers link correctly:
  ```bash
  docker-compose build
  ```
