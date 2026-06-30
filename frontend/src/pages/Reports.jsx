import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, ChevronRight, Download, Eye, Calendar, AlertCircle } from 'lucide-react'
import { api } from '../utils/api'

export default function Reports() {
  const [activeDatasetName, setActiveDatasetName] = useState('')
  const [activeResults, setActiveResults] = useState(null)

  useEffect(() => {
    const filename = localStorage.getItem('hm_active_dataset_filename')
    const resultsStr = localStorage.getItem('hm_mining_results')

    if (filename) setActiveDatasetName(filename)
    if (resultsStr) {
      try {
        setActiveResults(JSON.parse(resultsStr))
      } catch (_) {}
    }
  }, [])

  // Helper to export CSV of itemsets
  const exportItemsetsCSV = () => {
    if (!activeResults || !activeResults.itemsets) return
    
    const headers = ['Itemset', 'Support Count', 'Support %', 'Level']
    const rows = activeResults.itemsets.map(item => [
      `"${item.itemset.join(', ')}"`,
      item.support,
      `${(item.supportPct * 100).toFixed(1)}%`,
      item.level
    ])

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `frequent_itemsets_${activeDatasetName.replace(/\.[^/.]+$/, "")}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Helper to export CSV of rules
  const exportRulesCSV = () => {
    if (!activeResults || !activeResults.associationRules) return
    
    const headers = ['Antecedent', 'Consequent', 'Support %', 'Confidence %', 'Lift', 'Leverage', 'Conviction']
    const rows = activeResults.associationRules.map(rule => [
      `"${rule.antecedent.join(', ')}"`,
      `"${rule.consequent.join(', ')}"`,
      `${(rule.supportPct * 100).toFixed(1)}%`,
      `${(rule.confidence * 100).toFixed(1)}%`,
      rule.lift.toFixed(3),
      rule.leverage.toFixed(4),
      rule.conviction.toFixed(3)
    ])

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `association_rules_${activeDatasetName.replace(/\.[^/.]+$/, "")}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Print/HTML summary report
  const handlePrintSummary = () => {
    if (!activeResults) return
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>HealthMart Analytics Summary Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; }
            h1 { font-size: 24px; font-weight: bold; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px; }
            h2 { font-size: 16px; font-weight: bold; margin-top: 30px; margin-bottom: 12px; color: #0f172a; }
            .meta { font-size: 12px; color: #64748b; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; font-size: 12px; }
            th { bg-color: #f8fafc; font-weight: bold; }
            .badge { display: inline-block; padding: 2px 6px; font-size: 10px; font-weight: bold; border-radius: 4px; background: #e0f2fe; color: #0369a1; }
          </style>
        </head>
        <body>
          <h1>HealthMart Analytics Summary Report</h1>
          <div class="meta">
            <strong>Target Dataset:</strong> ${activeDatasetName}<br>
            <strong>Mining Algorithm:</strong> DiffNodeset Engine (C++14)<br>
            <strong>Generated At:</strong> ${new Date().toLocaleString()}
          </div>
          
          <h2>Platform Execution Metrics</h2>
          <table>
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Total Frequent Itemsets Mined</td><td>${activeResults.totalFrequentItemsets}</td></tr>
            <tr><td>Total Association Rules Generated</td><td>${activeResults.totalRules}</td></tr>
            <tr><td>Execution Time</td><td>${activeResults.executionTime}</td></tr>
            <tr><td>Memory Allocated</td><td>${activeResults.memoryUsage}</td></tr>
          </table>

          <h2>Sample Discovered Frequent Itemsets</h2>
          <table>
            <thead>
              <tr><th>Itemset</th><th>Support Count</th><th>Support %</th><th>Complexity Level</th></tr>
            </thead>
            <tbody>
              ${activeResults.itemsets.slice(0, 8).map(item => `
                <tr>
                  <td><code>${item.itemset.join(', ')}</code></td>
                  <td>${item.support}</td>
                  <td>${(item.supportPct * 100).toFixed(1)}%</td>
                  <td><span class="badge">Level ${item.level}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Sample Significant Association Rules</h2>
          <table>
            <thead>
              <tr><th>Antecedent</th><th>Consequent</th><th>Support</th><th>Confidence</th><th>Lift</th><th>Leverage</th></tr>
            </thead>
            <tbody>
              ${activeResults.associationRules.slice(0, 8).map(rule => `
                <tr>
                  <td><code>${rule.antecedent.join(', ')}</code></td>
                  <td><code>${rule.consequent.join(', ')}</code></td>
                  <td>${(rule.supportPct * 100).toFixed(1)}%</td>
                  <td>${(rule.confidence * 100).toFixed(1)}%</td>
                  <td>${rule.lift.toFixed(2)}x</td>
                  <td>${rule.leverage.toFixed(4)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <script>window.print();</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <span>App</span><ChevronRight className="w-3 h-3" /><span className="text-slate-700 font-semibold">Reports</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Export, preview, and download structured analytics packages.</p>
      </motion.div>

      {/* active banner */}
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex items-center gap-4"
      >
        <FileText className="w-8 h-8 text-blue-500 shrink-0" />
        <div>
          <p className="text-sm font-bold text-slate-800">DiffNodeset Analytical Reports</p>
          <p className="text-xs text-slate-500 mt-0.5">Export mined itemsets, confidence curves, and rule matrices as standard PDF/CSV summaries.</p>
        </div>
      </motion.div>

      {/* Reports Section */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800">Available Report Exports</h3>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full font-bold">Standard Formats</span>
        </div>
        
        <div className="divide-y divide-slate-100">
          {activeResults ? (
            <>
              {/* Report 1: Frequent Itemsets */}
              <div className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <FileText className="w-4.5 h-4.5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Frequent Itemsets Table</p>
                    <p className="text-[10px] text-slate-400">Dataset: {activeDatasetName} · {activeResults.totalFrequentItemsets} patterns</p>
                  </div>
                </div>
                <button
                  onClick={exportItemsetsCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
              </div>

              {/* Report 2: Association Rules */}
              <div className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                    <FileText className="w-4.5 h-4.5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Association Rules Table</p>
                    <p className="text-[10px] text-slate-400">Dataset: {activeDatasetName} · {activeResults.totalRules} rules</p>
                  </div>
                </div>
                <button
                  onClick={exportRulesCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
              </div>

              {/* Report 3: Print/PDF Summary */}
              <div className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <FileText className="w-4.5 h-4.5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Comprehensive Analytics Summary</p>
                    <p className="text-[10px] text-slate-400">Generate printable PDF layout with executive visualizations</p>
                  </div>
                </div>
                <button
                  onClick={handlePrintSummary}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Print/PDF
                </button>
              </div>
            </>
          ) : (
            <div className="p-8 flex flex-col items-center justify-center text-center gap-3">
              <AlertCircle className="w-8 h-8 text-slate-400" />
              <p className="text-sm font-bold text-slate-700">No Mined Results Available</p>
              <p className="text-xs text-slate-500 max-w-sm">You must upload a dataset and run pattern mining inside the Dataset Manager before reports can be exported.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
