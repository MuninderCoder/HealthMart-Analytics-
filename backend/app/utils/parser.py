import re
import math
from typing import List, Dict, Any, Tuple
import pandas as pd
import numpy as np

ID_PATTERNS = ['id', 'code', 'no', 'num', 'number', 'key', 'index', 'ref', 'uuid', 'serial', 'mrn', 'record', 'pid', 'rid']
DATE_PATTERNS = ['date', 'time', 'dob', 'birth', 'visit', 'admit', 'discharge', 'created', 'updated', 'day', 'month', 'year', 'scheduled']
MULTI_PATTERNS = ['symptoms', 'symptom', 'medicines', 'medicine', 'medication', 'drugs', 'drug', 'diagnos', 'condition', 'treatment', 'procedure', 'complaint', 'comorbid', 'allerg', 'prescription', 'findings']
BOOL_VALUES = {'true', 'false', 'yes', 'no', '1', '0', 'y', 'n', 'positive', 'negative', 'present', 'absent'}

DATE_REGEX = [
    r'^\d{4}-\d{2}-\d{2}',
    r'^\d{1,2}/\d{1,2}/\d{2,4}',
    r'^\d{2}-\d{2}-\d{4}',
    r'^[a-zA-Z]{3,9}\s\d{1,2},?\s\d{4}'
]

def clean_val(v) -> str:
    if pd.isna(v):
        return ""
    return str(v).strip()

def detect_column_type(name: str, values: List[Any]) -> str:
    name_lower = re.sub(r'[\s_-]', '', name.lower())
    non_empty = [v for v in values if clean_val(v) != ""]
    if not non_empty:
        return 'empty'

    str_values = [clean_val(v) for v in non_empty]
    lower_values = [v.lower() for v in str_values]
    unique_set = set(lower_values)
    unique_ratio = len(unique_set) / len(non_empty)

    # 1. Identifier
    if any(p in name_lower for p in ID_PATTERNS) and unique_ratio > 0.8:
        return 'identifier'

    # 2. Boolean
    if all(v in BOOL_VALUES for v in lower_values):
        return 'boolean'

    # 3. Multi-value
    is_multi_name = any(p in name_lower for p in MULTI_PATTERNS)
    delim_count = sum(1 for v in str_values if any(d in v for d in [',', ';', '|']))
    if is_multi_name or delim_count > len(non_empty) * 0.25:
        return 'multi-value'

    # 4. Numeric
    def is_num(v: str) -> bool:
        clean = re.sub(r'[,%$_\s]', '', v)
        try:
            float(clean)
            return True
        except ValueError:
            return False

    if all(is_num(v) for v in str_values):
        return 'numeric'

    # 5. Date
    is_date_name = any(p in name_lower for p in DATE_PATTERNS)
    def match_date_regex(v: str) -> bool:
        return any(re.match(r, v) is not None for r in DATE_REGEX)

    date_matches = sum(1 for v in str_values if match_date_regex(v))
    if (is_date_name and date_matches > len(non_empty) * 0.4) or date_matches > len(non_empty) * 0.8:
        return 'date'

    # 6. Categorical
    if unique_ratio < 0.25 and len(unique_set) <= 60 and all(len(v) < 60 for v in str_values):
        return 'categorical'

    # 7. Text (Default)
    return 'text'

def analyze_columns(df: pd.DataFrame) -> List[Dict[str, Any]]:
    analysis = []
    for col in df.columns:
        values = df[col].tolist()
        non_empty = [v for v in values if clean_val(v) != ""]
        missing = len(values) - len(non_empty)
        missing_pct = round((missing / len(values) * 100), 1) if values else 0

        str_values = [clean_val(v) for v in non_empty]
        unique_set = set(v.lower() for v in str_values)
        unique_ratio = len(unique_set) / len(non_empty) if non_empty else 0

        col_type = detect_column_type(col, values)

        # Get top unique sample values
        seen = set()
        samples = []
        for v in str_values:
            vl = v.lower()
            if vl not in seen:
                seen.add(vl)
                samples.append(v)
            if len(samples) >= 3:
                break

        # Top value
        freq = {}
        for v in str_values:
            vl = v.lower()
            freq[vl] = freq.get(vl, 0) + 1
        top_value = max(freq, key=freq.get) if freq else ""
        
        # Match case of top value
        top_value_orig = ""
        if top_value:
            for v in str_values:
                if v.lower() == top_value:
                    top_value_orig = v
                    break

        avg_len = round(sum(len(v) for v in str_values) / len(str_values)) if str_values else 0

        analysis.append({
            "col": col,
            "type": col_type,
            "total": len(values),
            "nonEmpty": len(non_empty),
            "missing": missing,
            "missingPct": missing_pct,
            "unique": len(unique_set),
            "uniqueRatio": unique_ratio,
            "sampleValues": samples,
            "topValue": top_value_orig,
            "avgLen": avg_len
        })
    return analysis

def compute_health_score(df: pd.DataFrame, col_analysis: List[Dict[str, Any]]) -> Dict[str, Any]:
    score = 100.0
    details = []

    # 1. Missing Values
    total_cells = df.size
    total_missing = sum(c["missing"] for c in col_analysis)
    missing_pct = (total_missing / total_cells * 100) if total_cells > 0 else 0
    if missing_pct > 0:
        penalty = min(missing_pct * 2.5, 30.0)
        score -= penalty
        details.append({
            "label": "Missing Values",
            "impact": f"-{round(penalty)}",
            "value": f"{round(missing_pct, 1)}% of cells",
            "severity": "low" if missing_pct < 5 else "medium" if missing_pct < 20 else "high"
        })

    # 2. Duplicate Rows
    dupes = df.duplicated().sum()
    if dupes > 0:
        pct = dupes / len(df) * 100
        penalty = min(pct * 2, 20.0)
        score -= penalty
        details.append({
            "label": "Duplicate Rows",
            "impact": f"-{round(penalty)}",
            "value": f"{dupes} rows ({round(pct, 1)}%)",
            "severity": "low" if pct < 2 else "medium" if pct < 10 else "high"
        })

    # 3. Empty Columns
    empty_cols = [c for c in col_analysis if c["type"] == "empty" or c["nonEmpty"] == 0]
    if empty_cols:
        penalty = min(len(empty_cols) * 5, 15.0)
        score -= penalty
        details.append({
            "label": "Empty Columns",
            "impact": f"-{round(penalty)}",
            "value": f"{len(empty_cols)} column(s)",
            "severity": "high"
        })

    # 4. Invalid Dates
    date_cols = [c["col"] for c in col_analysis if c["type"] == "date"]
    invalid_dates = 0
    for col in date_cols:
        for val in df[col].tolist():
            v_str = clean_val(val)
            if v_str != "":
                try:
                    pd.to_datetime(v_str, errors='raise')
                except Exception:
                    invalid_dates += 1
    if invalid_dates > 0:
        penalty = min((invalid_dates / len(df)) * 20, 10.0)
        score -= penalty
        details.append({
            "label": "Invalid Dates",
            "impact": f"-{round(penalty)}",
            "value": f"{invalid_dates} value(s)",
            "severity": "medium"
        })

    score = max(0, round(score))

    if score >= 90:
        grade = "Excellent"
        color = "emerald"
        desc = "Dataset is in great shape for analysis."
    elif score >= 75:
        grade = "Good"
        color = "blue"
        desc = "Minor issues detected — analysis ready."
    elif score >= 50:
        grade = "Average"
        color = "amber"
        desc = "Several issues need attention."
    else:
        grade = "Poor"
        color = "rose"
        desc = "Significant quality issues found."

    return {
        "score": score,
        "grade": grade,
        "color": color,
        "desc": desc,
        "details": details
    }

def generate_quality_checks(df: pd.DataFrame, col_analysis: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    checks = []

    # 1. Missing Values
    cols_with_missing = [c for c in col_analysis if c["missing"] > 0]
    total_missing = sum(c["missing"] for c in cols_with_missing)
    checks.append({
        "id": "missing",
        "label": "Missing Values",
        "severity": "pass" if total_missing == 0 else "low" if total_missing < len(df) * 0.05 else "medium" if total_missing < len(df) * 0.2 else "high",
        "count": total_missing,
        "message": "No missing values detected" if total_missing == 0 else f"{total_missing:,} missing in {len(cols_with_missing)} column(s): {', '.join(c['col'] for c in cols_with_missing[:3])}{'...' if len(cols_with_missing) > 3 else ''}"
    })

    # 2. Duplicate Rows
    dupes = int(df.duplicated().sum())
    checks.append({
        "id": "duplicates",
        "label": "Duplicate Rows",
        "severity": "pass" if dupes == 0 else "low" if dupes < 5 else "medium" if dupes < len(df) * 0.05 else "high",
        "count": dupes,
        "message": "No duplicate rows found" if dupes == 0 else f"{dupes} exact duplicate row(s) detected"
    })

    # 3. Empty Rows
    empty_rows = int(df.apply(lambda row: all(clean_val(x) == "" for x in row), axis=1).sum())
    checks.append({
        "id": "empty_rows",
        "label": "Empty Rows",
        "severity": "pass" if empty_rows == 0 else "low" if empty_rows < 5 else "medium",
        "count": empty_rows,
        "message": "No completely empty rows" if empty_rows == 0 else f"{empty_rows} empty row(s) found"
    })

    # 4. Empty Columns
    empty_cols = [c["col"] for c in col_analysis if c["nonEmpty"] == 0]
    checks.append({
        "id": "empty_cols",
        "label": "Empty Columns",
        "severity": "pass" if len(empty_cols) == 0 else "medium" if len(empty_cols) == 1 else "high",
        "count": len(empty_cols),
        "message": "All columns contain data" if len(empty_cols) == 0 else f"{len(empty_cols)} empty column(s): {', '.join(empty_cols)}"
    })

    # 5. Invalid Dates
    date_cols = [c["col"] for c in col_analysis if c["type"] == "date"]
    invalid_dates = 0
    for col in date_cols:
        for val in df[col].tolist():
            v_str = clean_val(val)
            if v_str != "":
                try:
                    pd.to_datetime(v_str, errors='raise')
                except Exception:
                    invalid_dates += 1
    checks.append({
        "id": "invalid_dates",
        "label": "Invalid Dates",
        "severity": "pass" if invalid_dates == 0 else "low" if invalid_dates < 10 else "medium",
        "count": invalid_dates,
        "message": "All date values are valid" if invalid_dates == 0 else f"{invalid_dates} invalid date(s) across {len(date_cols)} date column(s)"
    })

    # 6. Mixed Data Types
    mixed_cols = []
    for c in col_analysis:
        col = c["col"]
        vals = [v for v in df[col].tolist() if clean_val(v) != ""]
        if vals:
            num_count = sum(1 for v in vals if re.match(r'^-?\d+(\.\d+)?$', re.sub(r'[,%$_\s]', '', str(v))) is not None)
            if 0 < num_count < len(vals) * 0.9 and num_count > len(vals) * 0.1:
                mixed_cols.append(col)
    checks.append({
        "id": "mixed_types",
        "label": "Mixed Data Types",
        "severity": "pass" if len(mixed_cols) == 0 else "medium",
        "count": len(mixed_cols),
        "message": "No mixed-type columns detected" if len(mixed_cols) == 0 else f"{len(mixed_cols)} column(s) with mixed types: {', '.join(mixed_cols[:3])}{'...' if len(mixed_cols) > 3 else ''}"
    })

    # 7. Long Text Fields
    long_cols = [c["col"] for c in col_analysis if c["avgLen"] > 100]
    checks.append({
        "id": "long_text",
        "label": "Long Text Fields",
        "severity": "pass" if len(long_cols) == 0 else "low",
        "count": len(long_cols),
        "message": "No unusually long text fields" if len(long_cols) == 0 else f"{len(long_cols)} column(s) have very long text: {', '.join(long_cols[:2])}"
    })

    # 8. Identifier Columns
    id_cols = [c["col"] for c in col_analysis if c["type"] == "identifier"]
    checks.append({
        "id": "identifiers",
        "label": "Identifier Columns",
        "severity": "low" if len(id_cols) == 0 else "pass",
        "count": len(id_cols),
        "message": "No ID column detected — consider adding PatientID" if len(id_cols) == 0 else f"{len(id_cols)} identifier column(s) found: {', '.join(id_cols)}"
    })

    return checks

def generate_cleaning_suggestions(col_analysis: List[Dict[str, Any]], quality_checks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    suggestions = []
    
    def get_chk(id_str):
        for c in quality_checks:
            if c["id"] == id_str:
                return c
        return None

    missing_chk = get_chk("missing")
    if missing_chk and missing_chk["count"] > 0:
        cols = [c["col"] for c in col_analysis if c["missing"] > 0]
        suggestions.append({
            "id": "fill_missing",
            "priority": missing_chk["severity"],
            "title": "Fill Missing Values",
            "description": f"{missing_chk['count']:,} missing values in {len(cols)} column(s). Fill with 'Unknown', median, or mode depending on column type."
        })

    dupe_chk = get_chk("duplicates")
    if dupe_chk and dupe_chk["count"] > 0:
        suggestions.append({
            "id": "remove_dupes",
            "priority": dupe_chk["severity"],
            "title": "Remove Duplicate Rows",
            "description": f"{dupe_chk['count']} exact duplicate row(s) detected. Remove them to improve pattern mining accuracy."
        })

    multi_cols = [c["col"] for c in col_analysis if c["type"] == "multi-value"]
    if multi_cols:
        suggestions.append({
            "id": "normalize_mv",
            "priority": "medium",
            "title": "Normalize Multi-value Fields",
            "description": f"Standardize values in {', '.join(multi_cols[:3])}: trim whitespace, unify case, merge synonyms (e.g. 'Paracetamol' vs 'Paracetamol 500mg')."
        })

    date_cols = [c["col"] for c in col_analysis if c["type"] == "date"]
    if date_cols:
        suggestions.append({
            "id": "std_dates",
            "priority": "low",
            "title": "Standardize Date Format",
            "description": f"Convert all dates in {', '.join(date_cols)} to ISO format (YYYY-MM-DD) for consistent time-series analysis."
        })

    text_cols = [c["col"] for c in col_analysis if c["type"] in ["text", "categorical"]]
    if text_cols:
        suggestions.append({
            "id": "trim_spaces",
            "priority": "low",
            "title": "Trim Extra Whitespace",
            "description": "Remove leading/trailing spaces in text columns to prevent duplicate categories from whitespace differences."
        })

    empty_chk = get_chk("empty_rows")
    if empty_chk and empty_chk["count"] > 0:
        suggestions.append({
            "id": "remove_empty",
            "priority": "medium",
            "title": "Remove Empty Records",
            "description": f"{empty_chk['count']} completely empty row(s) should be removed before analysis."
        })

    cat_cols = [c["col"] for c in col_analysis if c["type"] == "categorical"]
    if cat_cols:
        suggestions.append({
            "id": "merge_cats",
            "priority": "low",
            "title": "Merge Similar Categories",
            "description": f"Review {', '.join(cat_cols[:3])} for similar category names (e.g. 'Diabetes' vs 'Type 2 Diabetes') that should be unified."
        })

    suggestions.extend([
        {
            "id": "medicine_names",
            "priority": "low",
            "title": "Normalize Medicine Names",
            "description": "Standardize drug names to generic names where possible to improve association rule quality."
        },
        {
            "id": "disease_names",
            "priority": "low",
            "title": "Standardize Disease Names",
            "description": "Map disease/diagnosis names to standard ICD-10 codes or a controlled vocabulary for better pattern matching."
        }
    ])

    return suggestions

def generate_transactions(df: pd.DataFrame, col_analysis: List[Dict[str, Any]]) -> Dict[str, Any]:
    tx_cols = [c["col"] for c in col_analysis if c["type"] in ["categorical", "multi-value", "boolean", "text"]]
    
    transactions = []
    for _, row in df.iterrows():
        items = []
        for col in tx_cols:
            val = row[col]
            v_str = clean_val(val)
            if v_str == "":
                continue
            
            # If multi-value, split by delimiters
            if any(c["type"] == "multi-value" and c["col"] == col for c in col_analysis):
                for part in re.split(r'[,;|]', v_str):
                    p_clean = part.strip()
                    if p_clean and 0 < len(p_clean) < 100:
                        items.append(p_clean)
            else:
                if 0 < len(v_str) < 80:
                    items.append(v_str)
        
        # Case insensitive deduplication
        seen = set()
        deduped = []
        for item in items:
            il = item.lower()
            if il not in seen:
                seen.add(il)
                deduped.append(item)
        if deduped:
            transactions.append(deduped)

    sizes = [len(t) for t in transactions]
    total_items = sum(sizes)
    avg_items = round(total_items / len(transactions), 1) if transactions else 0.0

    return {
        "transactions": transactions,
        "txCols": tx_cols,
        "stats": {
            "total": len(transactions),
            "avgItems": str(avg_items),
            "maxItems": max(sizes) if sizes else 0,
            "minItems": min(sizes) if sizes else 0,
            "totalItems": total_items
        }
    }

def find_column_by_patterns(col_analysis: List[Dict[str, Any]], patterns: List[str]) -> Dict[str, Any]:
    for c in col_analysis:
        col_lower = re.sub(r'[\s_-]', '', c["col"].lower())
        if any(p in col_lower for p in patterns):
            return c
    return None

def get_top_values(df: pd.DataFrame, col_info: Dict[str, Any], limit: int = 8) -> List[Dict[str, Any]]:
    if not col_info:
        return []
    freq = {}
    col = col_info["col"]
    is_multi = col_info["type"] == "multi-value"

    for val in df[col].tolist():
        v_str = clean_val(val)
        if v_str == "":
            continue
        if is_multi:
            for part in re.split(r'[,;|]', v_str):
                p = part.strip()
                if p:
                    freq[p] = freq.get(p, 0) + 1
        else:
            freq[v_str] = freq.get(v_str, 0) + 1

    total = sum(freq.values())
    sorted_items = sorted(freq.items(), key=lambda x: x[1], reverse=True)[:limit]
    
    return [
        {
            "name": name,
            "count": count,
            "pct": str(round(count / total * 100, 1)) if total > 0 else "0"
        }
        for name, count in sorted_items
    ]

def compute_analytics(df: pd.DataFrame, col_analysis: List[Dict[str, Any]]) -> Dict[str, Any]:
    disease_col = find_column_by_patterns(col_analysis, ['diagnos', 'disease', 'condition', 'disorder', 'icd'])
    medicine_col = find_column_by_patterns(col_analysis, ['medicine', 'drug', 'medication', 'prescription', 'rx', 'treatment'])
    doctor_col = find_column_by_patterns(col_analysis, ['doctor', 'physician', 'provider', 'clinician', 'dr', 'consultant'])
    dept_col = find_column_by_patterns(col_analysis, ['department', 'dept', 'ward', 'unit', 'specialty', 'section', 'division'])
    age_col = find_column_by_patterns(col_analysis, ['age'])
    gender_col = find_column_by_patterns(col_analysis, ['gender', 'sex'])
    symptom_col = find_column_by_patterns(col_analysis, ['symptom', 'complaint', 'presenting', 'chief'])

    gender_dist = None
    if gender_col:
        gender_dist = get_top_values(df, gender_col, 4)

    age_groups = None
    if age_col:
        groups = { '0–17': 0, '18–30': 0, '31–45': 0, '46–60': 0, '61–75': 0, '75+': 0 }
        total_ages = 0
        for val in df[age_col["col"]].tolist():
            try:
                age = int(float(str(val).strip()))
                total_ages += 1
                if age < 18:
                    groups['0–17'] += 1
                elif age <= 30:
                    groups['18–30'] += 1
                elif age <= 45:
                    groups['31–45'] += 1
                elif age <= 60:
                    groups['46–60'] += 1
                elif age <= 75:
                    groups['61–75'] += 1
                else:
                    groups['75+'] += 1
            except Exception:
                continue
        
        age_groups = [
            {
                "name": name,
                "count": count,
                "pct": str(round(count / total_ages * 100, 1)) if total_ages > 0 else "0"
            }
            for name, count in groups.items()
        ]

    return {
        "diseases": {
            "col": disease_col["col"] if disease_col else None,
            "items": get_top_values(df, disease_col, 8),
            "unique": disease_col["unique"] if disease_col else 0
        },
        "medicines": {
            "col": medicine_col["col"] if medicine_col else None,
            "items": get_top_values(df, medicine_col, 8),
            "unique": medicine_col["unique"] if medicine_col else 0
        },
        "doctors": {
            "col": doctor_col["col"] if doctor_col else None,
            "items": get_top_values(df, doctor_col, 6),
            "unique": doctor_col["unique"] if doctor_col else 0
        },
        "departments": {
            "col": dept_col["col"] if dept_col else None,
            "items": get_top_values(df, dept_col, 8),
            "unique": dept_col["unique"] if dept_col else 0
        },
        "symptoms": {
            "col": symptom_col["col"] if symptom_col else None,
            "items": get_top_values(df, symptom_col, 8),
            "unique": symptom_col["unique"] if symptom_col else 0
        },
        "genderDist": gender_dist,
        "ageGroups": age_groups
    }

def format_file_size(num_bytes: int) -> str:
    if num_bytes < 1024:
        return f"{num_bytes} B"
    elif num_bytes < 1024 * 1024:
        return f"{round(num_bytes / 1024, 1)} KB"
    else:
        return f"{round(num_bytes / (1024 * 1024), 2)} MB"

def parse_dataset_file(file_path: str, orig_filename: str) -> Dict[str, Any]:
    ext = orig_filename.split('.')[-1].lower()
    if ext == 'csv':
        df = pd.read_csv(file_path, keep_default_na=False)
    elif ext in ['xlsx', 'xls']:
        df = pd.read_excel(file_path, keep_default_na=False)
    else:
        raise ValueError(f"Unsupported file extension: .{ext}")

    if df.empty:
        raise ValueError("The dataset file is empty.")

    columns = df.columns.tolist()
    records_count = len(df)

    col_analysis = analyze_columns(df)
    health = compute_health_score(df, col_analysis)
    quality_checks = generate_quality_checks(df, col_analysis)
    suggestions = generate_cleaning_suggestions(col_analysis, quality_checks)
    transactions = generate_transactions(df, col_analysis)
    analytics = compute_analytics(df, col_analysis)

    # Preview data: first 100 rows as JSON-serializable list of dicts
    preview_df = df.head(100).replace({np.nan: None})
    preview_data = preview_df.to_dict(orient='records')

    # Convert everything to standard native Python types for JSON serialization
    return {
        "filename": orig_filename,
        "columns": columns,
        "rowsCount": records_count,
        "colAnalysis": col_analysis,
        "health": health,
        "qualityChecks": quality_checks,
        "suggestions": suggestions,
        "transactions": transactions,
        "analytics": analytics,
        "previewData": preview_data
    }
