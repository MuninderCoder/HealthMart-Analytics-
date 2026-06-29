// ─── Statistics ───────────────────────────────────────────────────────────────
export const stats = [
  { id: 1, label: "Hospitals Supported", value: 2840, suffix: "+", icon: "Hospital" },
  { id: 2, label: "Healthcare Records", value: 12.4, suffix: "M+", icon: "FileText" },
  { id: 3, label: "Medicine Patterns", value: 98600, suffix: "+", icon: "Pill" },
  { id: 4, label: "Analytics Generated", value: 340000, suffix: "+", icon: "BarChart3" },
];

// ─── Features ─────────────────────────────────────────────────────────────────
export const features = [
  {
    id: 1,
    icon: "Activity",
    title: "Disease Analytics",
    description: "Discover frequent disease patterns from historical healthcare records using advanced data mining techniques.",
    color: "blue",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    id: 2,
    icon: "Pill",
    title: "Medicine Association Analysis",
    description: "Identify medicines frequently prescribed or purchased together to optimize formulary management.",
    color: "emerald",
    gradient: "from-emerald-500 to-emerald-600",
  },
  {
    id: 3,
    icon: "BarChart3",
    title: "Healthcare Dashboards",
    description: "Interactive charts and visual healthcare insights designed for clinical decision support.",
    color: "violet",
    gradient: "from-violet-500 to-violet-600",
  },
  {
    id: 4,
    icon: "Sparkles",
    title: "AI Insights",
    description: "Natural language explanations of discovered patterns, making analytics accessible to all stakeholders.",
    color: "amber",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    id: 5,
    icon: "Cpu",
    title: "Pattern Mining Engine",
    description: "Powered by the DiffNodeset algorithm for lightning-fast frequent itemset mining at scale.",
    color: "rose",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    id: 6,
    icon: "ShieldCheck",
    title: "Secure Data Upload",
    description: "Upload CSV and Excel healthcare datasets with enterprise-grade encryption and compliance.",
    color: "teal",
    gradient: "from-teal-500 to-teal-600",
  },
];

// ─── How It Works ─────────────────────────────────────────────────────────────
export const steps = [
  { id: 1, title: "Upload Dataset", desc: "Import CSV or Excel healthcare records securely", icon: "Upload" },
  { id: 2, title: "Analyze Data", desc: "Automated preprocessing and quality validation", icon: "ScanSearch" },
  { id: 3, title: "Discover Patterns", desc: "DiffNodeset algorithm mines frequent itemsets", icon: "Network" },
  { id: 4, title: "Visualize Insights", desc: "Interactive dashboards with rich charts", icon: "LayoutDashboard" },
  { id: 5, title: "Generate Reports", desc: "Export AI-annotated PDF and Excel reports", icon: "FileDown" },
];

// ─── Dashboard: Top Diseases ──────────────────────────────────────────────────
export const topDiseases = [
  { name: "Hypertension", count: 18420, trend: "+12%", color: "#3b82f6" },
  { name: "Type 2 Diabetes", count: 15380, trend: "+8%", color: "#10b981" },
  { name: "Asthma", count: 11200, trend: "-3%", color: "#8b5cf6" },
  { name: "Cardiovascular Disease", count: 9870, trend: "+5%", color: "#f59e0b" },
  { name: "COPD", count: 7640, trend: "-1%", color: "#ef4444" },
];

// ─── Dashboard: Top Medicines ─────────────────────────────────────────────────
export const topMedicines = [
  { name: "Metformin", count: 12300, category: "Antidiabetic", color: "#06b6d4" },
  { name: "Amlodipine", count: 10800, category: "Antihypertensive", color: "#3b82f6" },
  { name: "Atorvastatin", count: 9200, category: "Statin", color: "#8b5cf6" },
  { name: "Omeprazole", count: 8100, category: "PPI", color: "#10b981" },
  { name: "Aspirin", count: 7400, category: "Antiplatelet", color: "#f59e0b" },
];

// ─── Dashboard: Symptom Patterns ─────────────────────────────────────────────
export const symptomPatterns = [
  { pattern: "Chest Pain + Shortness of Breath", support: 0.84, lift: 2.3 },
  { pattern: "Fever + Cough + Fatigue", support: 0.79, lift: 1.9 },
  { pattern: "Headache + Nausea + Dizziness", support: 0.71, lift: 1.7 },
  { pattern: "Joint Pain + Swelling + Stiffness", support: 0.63, lift: 2.1 },
  { pattern: "Polyuria + Polydipsia + Weight Loss", support: 0.58, lift: 3.4 },
];

// ─── Dashboard: Medicine Associations ────────────────────────────────────────
export const medicineAssociations = [
  { rule: "Metformin → Atorvastatin", confidence: 0.92, support: 0.67 },
  { rule: "Amlodipine → Aspirin", confidence: 0.87, support: 0.58 },
  { rule: "Lisinopril + Metoprolol → Aspirin", confidence: 0.81, support: 0.44 },
  { rule: "Omeprazole → Metformin", confidence: 0.76, support: 0.39 },
];

// ─── Dashboard: Recent Uploads ────────────────────────────────────────────────
export const recentUploads = [
  { id: 1, name: "hospital_records_Q4_2024.csv", rows: 84200, status: "analyzed", time: "2 hours ago", size: "12.4 MB" },
  { id: 2, name: "pharmacy_prescriptions_2024.xlsx", rows: 56800, status: "processing", time: "5 hours ago", size: "8.1 MB" },
  { id: 3, name: "outpatient_data_jan25.csv", rows: 32100, status: "analyzed", time: "1 day ago", size: "4.7 MB" },
  { id: 4, name: "symptom_survey_Q3.csv", rows: 12500, status: "queued", time: "2 days ago", size: "1.9 MB" },
];

// ─── Chart Data ───────────────────────────────────────────────────────────────
export const diseaseChartData = [
  { month: "Jan", hypertension: 3200, diabetes: 2800, asthma: 1900 },
  { month: "Feb", hypertension: 3800, diabetes: 3100, asthma: 2100 },
  { month: "Mar", hypertension: 4100, diabetes: 3400, asthma: 1800 },
  { month: "Apr", hypertension: 3700, diabetes: 3000, asthma: 2300 },
  { month: "May", hypertension: 4500, diabetes: 3800, asthma: 2000 },
  { month: "Jun", hypertension: 4200, diabetes: 3500, asthma: 2400 },
];

export const medicineChartData = [
  { name: "Metformin", value: 12300 },
  { name: "Amlodipine", value: 10800 },
  { name: "Atorvastatin", value: 9200 },
  { name: "Omeprazole", value: 8100 },
  { name: "Aspirin", value: 7400 },
  { name: "Others", value: 22000 },
];

export const PIE_COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#6b7280"];
