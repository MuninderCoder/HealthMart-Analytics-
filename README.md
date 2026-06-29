# HealthMart Analytics

HealthMart Analytics is a premium, modern Healthcare Analytics Platform designed to help hospitals, pharmacy chains, healthcare organizations, and researchers discover hidden patterns in healthcare data. 

*Note: The DiffNodeset mining engine and backend integrations will be implemented in the next phase. This release delivers a fully interactive, production-ready React frontend.*

---

## 📸 Screenshots
*(Screenshots to be added)*
- **Landing Page**: Premium interactive layout detailing features and workflow.
- **Dashboard Overview**: Key performance indicators, disease trend charts, and recent activity.
- **Dataset Manager**: Upload diagnostics, health scores, and structured transactional models.

---

## ✨ Features Completed (Phases 1 & 2)

### 🏥 Phase 1: Landing Page & Navigation
- **Landing Page**: Responsive layout with smooth Framer Motion micro-animations.
- **Navigation**: Sidebar layout (collapsible) and responsive TopBar for the main application, fully integrated with React Router.
- **Dashboard Overview**: KPI cards, area trend charts for diseases, medicine distribution charts, recent uploads list, and frequent patterns widget.

### 📊 Phase 2: Dataset Upload & Management
- **Dataset Upload**: Drag & drop zone with file type validation (.csv, .xlsx, .xls) and upload progress tracking.
- **Dataset Parsing**: Integrates PapaParse and SheetJS (xlsx) directly in React state.
- **Dataset Preview**: Sticky-header paginated table with column sorting and search.
- **Dataset Information**: Automatic extraction of metadata (file size, file type, rows, columns, upload time).

### 🔍 Phase 2B: Diagnostic Analysis & Transaction Modeling
- **Smart Column Detection**: Classifies fields into Identifier, Numeric, Categorical, Date, Boolean, Multi-value, or Text.
- **Circular Health Score**: Calculates health percentage and grading (Excellent, Good, Average, Poor) with a breakdown of quality penalties.
- **Quality Diagnostics**: Scans for empty structures, duplicate records, mixed types, and format errors.
- **Cleaning Recommendations**: Priority-guided cleaning recommendations (High, Medium, Low).
- **Transaction Generator**: Converts tabular records into deduplicated transactional itemsets for future itemset mining.
- **Clinical Analytics**: Plots demographic charts (Gender, Age groups) and physician/department workloads.
- **Readiness Panel**: Verifies formatting diagnostics before displaying a disabled DiffNodeset "Run Pattern Mining" action.
- **Upload History**: Local session history allowing users to re-view or delete parsed datasets.

---

## 🛠️ Tech Stack
- **Core Framework**: React 19
- **Bundler & Tooling**: Vite 8, Oxlint
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Parsing Engines**: PapaParse (CSV), SheetJS (XLSX/XLS)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Navigation**: React Router DOM 7

---

## 📂 Folder Structure

```text
HealthMart-Analytics/
├── README.md
├── package.json
├── .gitignore
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   └── dataset/
    │   ├── data/
    │   ├── layouts/
    │   ├── pages/
    │   ├── utils/
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── .oxlintrc.json
```

---

## 🚀 Installation & Running Locally

### Prerequisites
Make sure you have Node.js (v18+) installed.

### 1. Clone the Repository
```bash
git clone https://github.com/MuninderCoder/HealthMart-Analytics-.git
cd HealthMart-Analytics
```

### 2. Install Dependencies
Install packages for the project from the root folder:
```bash
npm install
```
*(This will install dependencies for the root and the frontend).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

### 4. Build Production Bundle
```bash
npm run build
```
The optimized production bundle will be generated in `frontend/dist/`.

---

## 🗺️ Future Roadmap (Phase 3)
- **DiffNodeset Mining Engine**: Connect the backend frequent itemset mining engine to uncover complex disease and medicine combinations.
- **Interactive Rule Visualizer**: Live association rule graphs showing Support, Confidence, and Lift metrics.
- **AI-generated Explanations**: Natural language summaries of discovered healthcare trends.
- **Database & Authentication**: Secure persistent storage and user accounts.

---

## 📄 License
This project is licensed under the MIT License.
