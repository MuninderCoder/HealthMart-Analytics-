# HealthMart Analytics

HealthMart Analytics is a premium, modern Healthcare Analytics Platform designed to help hospitals, pharmacy chains, healthcare organizations, and researchers discover hidden patterns in healthcare data.

---

## 📸 Screenshots
*(Screenshots to be added)*
- **Landing Page**: Premium interactive layout detailing features and workflow.
- **Dashboard Overview**: Key performance indicators, disease trend charts, and recent activity.
- **Dataset Manager**: Upload diagnostics, health scores, and structured transactional models.

---

## ✨ Features Completed (Phases 1, 2 & 3)

### 🏥 Phase 1: Landing Page & Navigation
- **Landing Page**: Responsive layout with smooth Framer Motion micro-animations.
- **Navigation**: Sidebar layout (collapsible) and responsive TopBar for the main application, fully integrated with React Router.
- **Dashboard Overview**: KPI cards, area trend charts for diseases, medicine distribution charts, recent uploads list, and frequent patterns widget.

### 📊 Phase 2: Dataset Upload & Management
- **Dataset Upload**: Drag & drop zone with file type validation (.csv, .xlsx, .xls) and upload progress tracking.
- **Dataset Preview**: Sticky-header paginated table with column sorting and search.
- **Dataset Information**: Automatic extraction of metadata (file size, file type, rows, columns, upload time).
- **Smart Column Detection**: Classifies fields into Identifier, Numeric, Categorical, Date, Boolean, Multi-value, or Text.
- **Circular Health Score**: Calculates health percentage and grading (Excellent, Good, Average, Poor) with a breakdown of quality penalties.
- **Quality Diagnostics**: Scans for empty structures, duplicate records, mixed types, and format errors.
- **Cleaning Recommendations**: Priority-guided cleaning recommendations (High, Medium, Low).
- **Transaction Generator**: Converts tabular records into deduplicated transactional itemsets.
- **Clinical Analytics**: Demographic charts (Gender, Age groups) and physician/department workloads.
- **Readiness Panel**: Verifies formatting diagnostics before displaying a disabled DiffNodeset "Run Pattern Mining" action.

### 🔌 Phase 3: Backend REST APIs & Full-Stack Integration
- **FastAPI Application**: High-performance Python backend serving REST endpoints.
- **CORS Middleware**: Configured to connect securely with the React frontend.
- **File & Metadata Persistence**: Non-database local storage (under `backend/uploads/`) saving both raw files (`{id}.{ext}`) and calculated parsing metadata (`{id}.json`).
- **Axios Integration**: Frontend communicates with the backend, replacing mock state with real API calls and displaying live upload progress.

---

## 🛠️ Tech Stack
### Frontend:
- **Core Framework**: React 19
- **Bundler & Tooling**: Vite 8, Oxlint
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React
- **Navigation**: React Router DOM 7

### Backend:
- **Framework**: FastAPI
- **Web Server**: Uvicorn
- **Data Engineering**: Pandas
- **Excel Reader**: OpenPyXL
- **File Upload**: python-multipart

---

## 📂 Folder Structure

```text
HealthMart-Analytics/
├── README.md
├── package.json
├── .gitignore
├── docs/
│   └── README.md
├── datasets/
│   ├── README.md
│   └── patient_records.csv   (Sample test file)
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── endpoints.py
│   │   ├── services/
│   │   │   └── dataset_service.py
│   │   ├── schemas/
│   │   │   └── dataset.py
│   │   ├── utils/
│   │   │   └── parser.py
│   │   ├── algorithm/
│   │   └── main.py
│   ├── uploads/
│   └── requirements.txt
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   └── dataset/
    │   ├── data/
    │   ├── layouts/
    │   ├── pages/
    │   └── utils/
    │       └── api.js
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Installation & Running Locally

### Prerequisites
Make sure you have Node.js (v18+) and Python (v3.10+) installed.

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Install Backend Dependencies
```bash
pip install -r backend/requirements.txt
```

### 3. Run Backend Server
```bash
# Start backend on http://127.0.0.1:8000
python backend/app/main.py
```
*Swagger API Docs are available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)*

### 4. Run Frontend Server
```bash
# Start React frontend on http://localhost:5173
npm run dev
```

### 5. Build Production Bundle
```bash
npm run build
```

---

## 🗺️ Future Roadmap (Phase 4)
- **DiffNodeset Mining Engine**: Connect the C++ frequent itemset mining engine to discover complex disease and medicine combinations.
- **Interactive Rule Visualizer**: Live association rule graphs showing Support, Confidence, and Lift metrics.
- **AI-generated Explanations**: Natural language summaries of discovered healthcare trends.
- **Database & Authentication**: Secure persistent storage and user accounts.

---

## 📄 License
This project is licensed under the MIT License.
