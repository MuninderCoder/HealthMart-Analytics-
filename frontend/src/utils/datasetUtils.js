// ─── Original Column Type Detection (kept for compatibility) ─────────────────
export function detectColumnType(values) {
  const nonEmpty = values.filter(
    (v) => v !== null && v !== undefined && String(v).trim() !== ''
  )
  if (nonEmpty.length === 0) return 'Text'
  const boolSet = new Set(['true', 'false', 'yes', 'no', '1', '0'])
  if (nonEmpty.every((v) => boolSet.has(String(v).toLowerCase()))) return 'Boolean'
  if (nonEmpty.every((v) => !isNaN(Number(String(v).replace(/,/g, ''))) && String(v).trim() !== ''))
    return 'Number'
  const dateRe = [/^\d{4}-\d{2}-\d{2}$/, /^\d{2}\/\d{2}\/\d{4}$/, /^\d{2}-\d{2}-\d{4}$/, /^\d{4}\/\d{2}\/\d{2}$/, /^\w{3,9}\s\d{1,2},\s\d{4}$/]
  if (nonEmpty.every((v) => dateRe.some((re) => re.test(String(v).trim())))) return 'Date'
  return 'Text'
}

// ─── Original Column Stats (kept for compatibility) ───────────────────────────
export function getColumnStats(data, col) {
  const values = data.map((row) => row[col])
  const missing = values.filter((v) => v === null || v === undefined || String(v).trim() === '').length
  const unique = new Set(values.map((v) => String(v).trim().toLowerCase())).size
  const type = detectColumnType(values)
  return { col, type, missing, unique, total: values.length }
}

// ─── Dataset Summary ──────────────────────────────────────────────────────────
export function summarizeDataset(data, columns, file) {
  const totalMissing = columns.reduce((acc, col) => {
    return acc + data.filter((row) => row[col] === null || row[col] === undefined || String(row[col]).trim() === '').length
  }, 0)
  const seen = new Set()
  let duplicates = 0
  data.forEach((row) => {
    const key = JSON.stringify(row)
    if (seen.has(key)) duplicates++
    else seen.add(key)
  })
  const sizeKB = file ? (file.size / 1024).toFixed(1) : '—'
  const sizeMB = file && file.size > 1024 * 1024 ? (file.size / (1024 * 1024)).toFixed(2) + ' MB' : sizeKB + ' KB'
  return {
    records: data.length,
    columns: columns.length,
    missingValues: totalMissing,
    duplicateRows: duplicates,
    fileSize: sizeMB,
    fileType: file ? (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') ? 'Excel (.xlsx)' : 'CSV') : '—',
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//  PHASE 2B — ADVANCED ANALYSIS FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════════

const ID_PATTERNS     = ['id', 'code', 'no', 'num', 'number', 'key', 'index', 'ref', 'uuid', 'serial', 'mrn', 'record', 'pid', 'rid']
const DATE_PATTERNS   = ['date', 'time', 'dob', 'birth', 'visit', 'admit', 'discharge', 'created', 'updated', 'day', 'month', 'year', 'scheduled']
const MULTI_PATTERNS  = ['symptoms', 'symptom', 'medicines', 'medicine', 'medication', 'drugs', 'drug', 'diagnos', 'condition', 'treatment', 'procedure', 'complaint', 'comorbid', 'allerg', 'prescription', 'findings']
const BOOL_VALUES     = new Set(['true', 'false', 'yes', 'no', '1', '0', 'y', 'n', 'positive', 'negative', 'present', 'absent'])
const DATE_REGEX      = [/^\d{4}-\d{2}-\d{2}/, /^\d{1,2}\/\d{1,2}\/\d{2,4}/, /^\d{2}-\d{2}-\d{4}/, /^\w{3,9}\s\d{1,2},?\s\d{4}/]

// ─── Advanced Column Type Detection ──────────────────────────────────────────
export function detectColumnTypeAdvanced(name, values) {
  const nameLower = name.toLowerCase().replace(/[\s_-]/g, '')
  const nonEmpty = values.filter((v) => v !== null && v !== undefined && String(v).trim() !== '')
  if (nonEmpty.length === 0) return 'empty'

  const strValues = nonEmpty.map((v) => String(v).trim())
  const lowerValues = strValues.map((v) => v.toLowerCase())
  const uniqueSet = new Set(lowerValues)
  const uniqueRatio = uniqueSet.size / nonEmpty.length

  // Identifier: name looks like ID field + very high uniqueness
  if (ID_PATTERNS.some((p) => nameLower === p || nameLower.endsWith(p) || nameLower.startsWith(p)) && uniqueRatio > 0.8)
    return 'identifier'

  // Boolean
  if (strValues.every((v) => BOOL_VALUES.has(v.toLowerCase()))) return 'boolean'

  // Multi-value: name heuristic OR values contain delimiters consistently
  const isMultiName = MULTI_PATTERNS.some((p) => nameLower.includes(p))
  const delimCount = strValues.filter((v) => /[,;|]/.test(v)).length
  if (isMultiName || delimCount > nonEmpty.length * 0.25) return 'multi-value'

  // Numeric
  if (strValues.every((v) => !isNaN(Number(v.replace(/[,%$\s]/g, ''))))) return 'numeric'

  // Date
  const isDateName = DATE_PATTERNS.some((p) => nameLower.includes(p))
  const dateMatches = strValues.filter((v) => DATE_REGEX.some((r) => r.test(v))).length
  if ((isDateName && dateMatches > nonEmpty.length * 0.4) || dateMatches > nonEmpty.length * 0.8) return 'date'

  // Categorical: low unique ratio + short values
  if (uniqueRatio < 0.25 && uniqueSet.size <= 60 && strValues.every((v) => v.length < 60)) return 'categorical'

  // Text (default)
  return 'text'
}

// ─── Full Column Analysis ─────────────────────────────────────────────────────
export function analyzeColumnsFull(data, columns) {
  return columns.map((col) => {
    const values = data.map((row) => row[col])
    const nonEmpty = values.filter((v) => v !== null && v !== undefined && String(v).trim() !== '')
    const missing = values.length - nonEmpty.length
    const strValues = nonEmpty.map((v) => String(v).trim())
    const uniqueSet = new Set(strValues.map((v) => v.toLowerCase()))

    const type = detectColumnTypeAdvanced(col, values)

    // Sample values (up to 3 distinct)
    const sampleValues = [...uniqueSet].slice(0, 3)

    // Top value (most frequent)
    const freq = {}
    strValues.forEach((v) => { const k = v.toLowerCase(); freq[k] = (freq[k] || 0) + 1 })
    const topValue = Object.keys(freq).sort((a, b) => freq[b] - freq[a])[0] || ''

    // Avg length
    const avgLen = strValues.length > 0 ? Math.round(strValues.reduce((acc, v) => acc + v.length, 0) / strValues.length) : 0

    return {
      col,
      type,
      total: values.length,
      nonEmpty: nonEmpty.length,
      missing,
      missingPct: values.length > 0 ? parseFloat((missing / values.length * 100).toFixed(1)) : 0,
      unique: uniqueSet.size,
      uniqueRatio: nonEmpty.length > 0 ? uniqueSet.size / nonEmpty.length : 0,
      sampleValues,
      topValue,
      avgLen,
    }
  })
}

// ─── Dataset Health Score ─────────────────────────────────────────────────────
export function computeHealthScore(data, columnAnalysis) {
  let score = 100
  const details = []

  // Missing values
  const totalCells = data.length * columnAnalysis.length
  const totalMissing = columnAnalysis.reduce((acc, c) => acc + c.missing, 0)
  const missingPct = totalCells > 0 ? (totalMissing / totalCells * 100) : 0
  if (missingPct > 0) {
    const penalty = Math.min(missingPct * 2.5, 30)
    score -= penalty
    details.push({ label: 'Missing Values', impact: `-${penalty.toFixed(0)}`, value: `${missingPct.toFixed(1)}% of cells`, severity: missingPct < 5 ? 'low' : missingPct < 20 ? 'medium' : 'high' })
  }

  // Duplicate rows
  const seen = new Set()
  let dupes = 0
  data.forEach((row) => { const k = JSON.stringify(row); if (seen.has(k)) dupes++; else seen.add(k) })
  if (dupes > 0) {
    const pct = dupes / data.length * 100
    const penalty = Math.min(pct * 2, 20)
    score -= penalty
    details.push({ label: 'Duplicate Rows', impact: `-${penalty.toFixed(0)}`, value: `${dupes} rows (${pct.toFixed(1)}%)`, severity: pct < 2 ? 'low' : pct < 10 ? 'medium' : 'high' })
  }

  // Empty columns
  const emptyCols = columnAnalysis.filter((c) => c.type === 'empty' || c.nonEmpty === 0)
  if (emptyCols.length > 0) {
    const penalty = Math.min(emptyCols.length * 5, 15)
    score -= penalty
    details.push({ label: 'Empty Columns', impact: `-${penalty.toFixed(0)}`, value: `${emptyCols.length} column(s)`, severity: 'high' })
  }

  // Invalid dates
  const dateCols = columnAnalysis.filter((c) => c.type === 'date')
  let invalidDates = 0
  dateCols.forEach((c) => { data.forEach((row) => { if (row[c.col] && isNaN(Date.parse(String(row[c.col])))) invalidDates++ }) })
  if (invalidDates > 0) {
    const penalty = Math.min(invalidDates / data.length * 20, 10)
    score -= penalty
    details.push({ label: 'Invalid Dates', impact: `-${penalty.toFixed(0)}`, value: `${invalidDates} value(s)`, severity: 'medium' })
  }

  score = Math.max(0, Math.round(score))

  let grade, color, desc
  if (score >= 90) { grade = 'Excellent'; color = 'emerald'; desc = 'Dataset is in great shape for analysis.' }
  else if (score >= 75) { grade = 'Good';      color = 'blue';    desc = 'Minor issues detected — analysis ready.' }
  else if (score >= 50) { grade = 'Average';   color = 'amber';   desc = 'Several issues need attention.' }
  else               { grade = 'Poor';      color = 'rose';    desc = 'Significant quality issues found.' }

  return { score, grade, color, desc, details }
}

// ─── Quality Checks ───────────────────────────────────────────────────────────
export function generateQualityChecks(data, columns, columnAnalysis) {
  const checks = []

  // 1. Missing values
  const colsWithMissing = columnAnalysis.filter((c) => c.missing > 0)
  const totalMissing = colsWithMissing.reduce((acc, c) => acc + c.missing, 0)
  checks.push({
    id: 'missing', label: 'Missing Values',
    severity: totalMissing === 0 ? 'pass' : totalMissing < data.length * 0.05 ? 'low' : totalMissing < data.length * 0.2 ? 'medium' : 'high',
    count: totalMissing,
    message: totalMissing === 0
      ? 'No missing values detected'
      : `${totalMissing.toLocaleString()} missing in ${colsWithMissing.length} column(s): ${colsWithMissing.slice(0, 3).map((c) => c.col).join(', ')}${colsWithMissing.length > 3 ? '…' : ''}`,
  })

  // 2. Duplicate rows
  const seen2 = new Set(); let dupes = 0
  data.forEach((row) => { const k = JSON.stringify(row); if (seen2.has(k)) dupes++; else seen2.add(k) })
  checks.push({
    id: 'duplicates', label: 'Duplicate Rows',
    severity: dupes === 0 ? 'pass' : dupes < 5 ? 'low' : dupes < data.length * 0.05 ? 'medium' : 'high',
    count: dupes,
    message: dupes === 0 ? 'No duplicate rows found' : `${dupes} exact duplicate row(s) detected`,
  })

  // 3. Empty rows
  const emptyRows = data.filter((row) => columns.every((col) => !row[col] || String(row[col]).trim() === '')).length
  checks.push({
    id: 'empty_rows', label: 'Empty Rows',
    severity: emptyRows === 0 ? 'pass' : emptyRows < 5 ? 'low' : 'medium',
    count: emptyRows,
    message: emptyRows === 0 ? 'No completely empty rows' : `${emptyRows} empty row(s) found`,
  })

  // 4. Empty columns
  const emptyCols = columnAnalysis.filter((c) => c.nonEmpty === 0)
  checks.push({
    id: 'empty_cols', label: 'Empty Columns',
    severity: emptyCols.length === 0 ? 'pass' : emptyCols.length === 1 ? 'medium' : 'high',
    count: emptyCols.length,
    message: emptyCols.length === 0 ? 'All columns contain data' : `${emptyCols.length} empty column(s): ${emptyCols.map((c) => c.col).join(', ')}`,
  })

  // 5. Invalid dates
  const dateCols = columnAnalysis.filter((c) => c.type === 'date')
  let invalidDates = 0
  dateCols.forEach((c) => { data.forEach((row) => { if (row[c.col] && isNaN(Date.parse(String(row[c.col])))) invalidDates++ }) })
  checks.push({
    id: 'invalid_dates', label: 'Invalid Dates',
    severity: invalidDates === 0 ? 'pass' : invalidDates < 10 ? 'low' : 'medium',
    count: invalidDates,
    message: invalidDates === 0 ? 'All date values are valid' : `${invalidDates} invalid date(s) across ${dateCols.length} date column(s)`,
  })

  // 6. Mixed data types
  const mixedCols = columnAnalysis.filter((c) => {
    const vals = data.map((r) => r[c.col]).filter((v) => v !== null && v !== undefined && String(v).trim() !== '')
    const numCount = vals.filter((v) => !isNaN(Number(String(v)))).length
    return numCount > 0 && numCount < vals.length * 0.9 && numCount > vals.length * 0.1
  })
  checks.push({
    id: 'mixed_types', label: 'Mixed Data Types',
    severity: mixedCols.length === 0 ? 'pass' : 'medium',
    count: mixedCols.length,
    message: mixedCols.length === 0 ? 'No mixed-type columns detected' : `${mixedCols.length} column(s) with mixed types: ${mixedCols.slice(0, 3).map((c) => c.col).join(', ')}`,
  })

  // 7. Long text fields (avg > 100 chars)
  const longTextCols = columnAnalysis.filter((c) => c.avgLen > 100)
  checks.push({
    id: 'long_text', label: 'Long Text Fields',
    severity: longTextCols.length === 0 ? 'pass' : 'low',
    count: longTextCols.length,
    message: longTextCols.length === 0 ? 'No unusually long text fields' : `${longTextCols.length} column(s) have very long text: ${longTextCols.slice(0, 2).map((c) => c.col).join(', ')}`,
  })

  // 8. Identifier columns
  const idCols = columnAnalysis.filter((c) => c.type === 'identifier')
  checks.push({
    id: 'identifiers', label: 'Identifier Columns',
    severity: idCols.length === 0 ? 'low' : 'pass',
    count: idCols.length,
    message: idCols.length === 0
      ? 'No ID column detected — consider adding PatientID'
      : `${idCols.length} identifier column(s) found: ${idCols.map((c) => c.col).join(', ')}`,
  })

  return checks
}

// ─── Cleaning Suggestions ─────────────────────────────────────────────────────
export function generateCleaningSuggestions(columnAnalysis, qualityChecks) {
  const suggestions = []
  const get = (id) => qualityChecks.find((c) => c.id === id)

  const missingChk = get('missing')
  if (missingChk?.count > 0) {
    const cols = columnAnalysis.filter((c) => c.missing > 0)
    suggestions.push({ id: 'fill_missing', priority: missingChk.severity, title: 'Fill Missing Values', description: `${missingChk.count.toLocaleString()} missing values in ${cols.length} column(s). Fill with "Unknown", median, or mode depending on column type.` })
  }

  const dupeChk = get('duplicates')
  if (dupeChk?.count > 0)
    suggestions.push({ id: 'remove_dupes', priority: dupeChk.severity, title: 'Remove Duplicate Rows', description: `${dupeChk.count} exact duplicate row(s) detected. Remove them to improve pattern mining accuracy.` })

  const multiCols = columnAnalysis.filter((c) => c.type === 'multi-value')
  if (multiCols.length > 0)
    suggestions.push({ id: 'normalize_mv', priority: 'medium', title: 'Normalize Multi-value Fields', description: `Standardize values in ${multiCols.slice(0,3).map((c) => c.col).join(', ')}: trim whitespace, unify case, merge synonyms (e.g. "Paracetamol" vs "Paracetamol 500mg").` })

  const dateCols = columnAnalysis.filter((c) => c.type === 'date')
  if (dateCols.length > 0)
    suggestions.push({ id: 'std_dates', priority: 'low', title: 'Standardize Date Format', description: `Convert all dates in ${dateCols.map((c) => c.col).join(', ')} to ISO format (YYYY-MM-DD) for consistent time-series analysis.` })

  const textCols = columnAnalysis.filter((c) => ['text', 'categorical'].includes(c.type))
  if (textCols.length > 0)
    suggestions.push({ id: 'trim_spaces', priority: 'low', title: 'Trim Extra Whitespace', description: `Remove leading/trailing spaces in text columns to prevent duplicate categories from whitespace differences.` })

  const emptyChk = get('empty_rows')
  if (emptyChk?.count > 0)
    suggestions.push({ id: 'remove_empty', priority: 'medium', title: 'Remove Empty Records', description: `${emptyChk.count} completely empty row(s) should be removed before analysis.` })

  const catCols = columnAnalysis.filter((c) => c.type === 'categorical')
  if (catCols.length > 0)
    suggestions.push({ id: 'merge_cats', priority: 'low', title: 'Merge Similar Categories', description: `Review ${catCols.slice(0,3).map((c) => c.col).join(', ')} for similar category names (e.g. "Diabetes" vs "Type 2 Diabetes") that should be unified.` })

  suggestions.push({ id: 'medicine_names', priority: 'low', title: 'Normalize Medicine Names', description: 'Standardize drug names to generic names where possible to improve association rule quality.' })

  suggestions.push({ id: 'disease_names', priority: 'low', title: 'Standardize Disease Names', description: 'Map disease/diagnosis names to standard ICD-10 codes or a controlled vocabulary for better pattern matching.' })

  return suggestions
}

// ─── Transaction Generator ────────────────────────────────────────────────────
export function generateTransactions(data, columnAnalysis) {
  // Select columns meaningful for transactions
  const txCols = columnAnalysis.filter((c) => {
    if (['identifier', 'empty'].includes(c.type)) return false
    if (c.type === 'numeric') return false
    if (c.type === 'date') return false
    return ['categorical', 'multi-value', 'boolean', 'text'].includes(c.type)
  })

  const transactions = data.map((row) => {
    const items = []
    txCols.forEach((c) => {
      const val = row[c.col]
      if (val === null || val === undefined || String(val).trim() === '') return
      if (c.type === 'multi-value') {
        String(val).split(/[,;|]/).map((p) => p.trim()).filter((p) => p.length > 0 && p.length < 100).forEach((p) => items.push(p))
      } else {
        const s = String(val).trim()
        if (s.length > 0 && s.length < 80) items.push(s)
      }
    })
    // Deduplicate case-insensitively
    const seen = new Set()
    return items.filter((item) => { const k = item.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true })
  }).filter((tx) => tx.length >= 1)

  const sizes = transactions.map((tx) => tx.length)
  const totalItems = sizes.reduce((a, b) => a + b, 0)

  return {
    transactions,
    txCols: txCols.map((c) => c.col),
    stats: {
      total: transactions.length,
      avgItems: sizes.length > 0 ? (totalItems / sizes.length).toFixed(1) : '0',
      maxItems: sizes.length > 0 ? Math.max(...sizes) : 0,
      minItems: sizes.length > 0 ? Math.min(...sizes) : 0,
      totalItems,
    },
  }
}

// ─── Analytics Overview ───────────────────────────────────────────────────────
function findCol(columnAnalysis, patterns) {
  return columnAnalysis.find((c) => patterns.some((p) => c.col.toLowerCase().replace(/[\s_-]/g, '').includes(p.replace(/[\s_-]/g, ''))))
}

function getTopValues(data, colInfo, limit = 8) {
  if (!colInfo) return []
  const freq = {}
  data.forEach((row) => {
    const val = row[colInfo.col]
    if (!val || String(val).trim() === '') return
    const process = (v) => { const k = v.trim(); if (k) freq[k] = (freq[k] || 0) + 1 }
    if (colInfo.type === 'multi-value') {
      String(val).split(/[,;|]/).forEach((v) => process(v.trim()))
    } else {
      process(String(val))
    }
  })
  const total = Object.values(freq).reduce((a, b) => a + b, 0)
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([name, count]) => ({ name, count, pct: total > 0 ? (count / total * 100).toFixed(1) : '0' }))
}

export function computeAnalyticsOverview(data, columnAnalysis) {
  const diseaseCol  = findCol(columnAnalysis, ['diagnos', 'disease', 'condition', 'disorder', 'icd'])
  const medicineCol = findCol(columnAnalysis, ['medicine', 'drug', 'medication', 'prescription', 'rx', 'treatment'])
  const doctorCol   = findCol(columnAnalysis, ['doctor', 'physician', 'provider', 'clinician', 'dr', 'consultant'])
  const deptCol     = findCol(columnAnalysis, ['department', 'dept', 'ward', 'unit', 'specialty', 'section', 'division'])
  const ageCol      = findCol(columnAnalysis, ['age'])
  const genderCol   = findCol(columnAnalysis, ['gender', 'sex'])
  const symptomCol  = findCol(columnAnalysis, ['symptom', 'complaint', 'presenting', 'chief'])

  // Gender distribution
  let genderDist = null
  if (genderCol) {
    const freq = {}
    data.forEach((row) => { const v = String(row[genderCol.col] || '').trim(); if (v) freq[v] = (freq[v] || 0) + 1 })
    const total = Object.values(freq).reduce((a, b) => a + b, 0)
    genderDist = Object.entries(freq).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count, pct: (count / total * 100).toFixed(1) }))
  }

  // Age groups
  let ageGroups = null
  if (ageCol) {
    const groups = { '0–17': 0, '18–30': 0, '31–45': 0, '46–60': 0, '61–75': 0, '75+': 0 }
    let total = 0
    data.forEach((row) => {
      const age = parseInt(String(row[ageCol.col] || ''))
      if (isNaN(age)) return
      total++
      if (age < 18) groups['0–17']++
      else if (age <= 30) groups['18–30']++
      else if (age <= 45) groups['31–45']++
      else if (age <= 60) groups['46–60']++
      else if (age <= 75) groups['61–75']++
      else groups['75+']++
    })
    ageGroups = Object.entries(groups).map(([name, count]) => ({ name, count, pct: total > 0 ? (count / total * 100).toFixed(1) : '0' }))
  }

  return {
    diseases:  { col: diseaseCol?.col,  items: getTopValues(data, diseaseCol,  8), unique: diseaseCol?.unique  || 0 },
    medicines: { col: medicineCol?.col, items: getTopValues(data, medicineCol, 8), unique: medicineCol?.unique || 0 },
    doctors:   { col: doctorCol?.col,   items: getTopValues(data, doctorCol,   6), unique: doctorCol?.unique   || 0 },
    departments:{ col: deptCol?.col,    items: getTopValues(data, deptCol,     8), unique: deptCol?.unique     || 0 },
    symptoms:  { col: symptomCol?.col,  items: getTopValues(data, symptomCol,  8), unique: symptomCol?.unique  || 0 },
    genderDist,
    ageGroups,
  }
}

// ─── Original validateDataset (kept for any backward references) ──────────────
export function validateDataset(data, columns) {
  return generateQualityChecks(data, columns, analyzeColumnsFull(data, columns))
}
