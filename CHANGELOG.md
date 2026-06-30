# Changelog

All notable changes to the HealthMart Analytics platform will be documented in this file.

## [1.0.0] - 2026-06-30

### Added
- **JWT & Role-Based Access Control**:
  - Secure signed base64url token encoder/decoder (HS256) inside `auth.py`.
  - Password hashing utilizing PBKDF2 SHA-256 with 100,000 iterations.
  - Seeding logic for default credentials: `admin`, `analyst`, `viewer` in `users.json`.
  - Route guards in React Router preventing unauthorized role access (e.g. Viewer cannot upload files; Analyst cannot print reports).
  - Admin management panel tab added in Settings for user list checking.
- **Advanced Dashboard & Counters**:
  - Custom React animation utility that transitions counters smoothly on page load.
  - TIMELINE TIMING AREA CHART depicting compiled C++ timing phases.
  - Pre-order/post-order candidate matrix bubble scatter charts.
  - Template-based Clinical Insights generation panel.
- **Pattern Explorer Page**:
  - Interactive table supporting level sorting, support filters, and keyword search.
  - Transaction-level overlay showing all parsed entries containing selected patterns.
  - High-fidelity visual markers highlighting medical diagnoses and medicine keywords.
- **Downloadable PDF Reporting**:
  - Print-styled window overlays for itemsets, association rules, and executive summaries (fully compatible with window.print() PDF outputs).
- **Dockerization Configuration**:
  - Python FastAPI base and Node multi-stage Dockerfiles.
  - Docker Compose linking services with persistent storage.
- **CI/CD Workflows**:
  - GitHub Actions compilation, C++ testing, Python dependency checks, and Vite compilation.

## [0.9.0] - 2026-06-25

### Added
- **FastAPI Backend Services**:
  - Dataset metadata storage, transaction conversion, and subprocess execution.
- **C++ Core Mining Engine**:
  - PPC Tree numbering, NodeSet extraction, DiffNodeset joining, Support and Confidence metrics evaluation.
- **Reports Export**:
  - CSV package down-loader for mined patterns and rules.
