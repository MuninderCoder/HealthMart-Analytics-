import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, ChevronRight, Download, Eye, Calendar, AlertCircle, Database, Award, Clock, Cpu } from 'lucide-react'
import { api } from '../utils/api'

export default function Reports() {
  const [activeDatasetName, setActiveDatasetName] = useState('')
  const [activeDatasetId, setActiveDatasetId] = useState('')
  const [activeResults, setActiveResults] = useState(null)
  const [datasetDetails, setDatasetDetails] = useState(null)

  useEffect(() => {
    const filename = localStorage.getItem('hm_active_dataset_filename')
    const resultsStr = localStorage.getItem('hm_mining_results')
    const activeId = localStorage.getItem('hm_active_dataset_id')

    if (filename) setActiveDatasetName(filename)
    if (activeId) {
      setActiveDatasetId(activeId)
      api.getDataset(activeId).then(details => {
        setDatasetDetails(details)
      }).catch(() => {})
    }
    if (resultsStr) {
      try {
        setActiveResults(JSON.parse(resultsStr))
      } catch (_) {}
    }
  }, [])

  // Export CSV of itemsets
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

  // Export CSV of rules
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

  // Helper to construct printable HTML frame with base styles
  const openPrintWindow = (title, contentHTML) => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; padding: 45px; line-height: 1.5; background: #fff; }
            h1 { font-size: 22px; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 25px; color: #1e3a8a; }
            h2 { font-size: 14px; font-weight: 700; margin-top: 30px; margin-bottom: 10px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; border-left: 3px solid #3b82f6; padding-left: 8px; }
            .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-bottom: 25px; font-size: 11px; }
            .meta-item span { color: #64748b; font-weight: 500; }
            .meta-item strong { color: #334155; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            th, td { border: 1px solid #e2e8f0; padding: 9px 12px; text-align: left; font-size: 11px; }
            th { background: #f1f5f9; font-weight: 700; color: #475569; }
            .badge { display: inline-block; padding: 2px 6px; font-size: 9px; font-weight: 700; border-radius: 4px; background: #dbeafe; color: #1e40af; }
            .progress-bg { background: #e2e8f0; border-radius: 9999px; height: 6px; width: 60px; display: inline-block; vertical-align: middle; margin-right: 8px; overflow: hidden; }
            .progress-fg { height: 100%; background: #3b82f6; border-radius: 9999px; }
            .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 10px; color: #94a3b8; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${contentHTML}
          <div class="footer">HealthMart Analytics Platform · Generated via compiled DiffNodeset C++ Engine</div>
          <script>window.print();</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // Print Itemsets PDF
  const handlePrintItemsets = () => {
    if (!activeResults || !activeResults.itemsets) return
    const content = `
      <h1>Frequent Symptom Combinations</h1>
      <div class="meta-grid">
        <div class="meta-item"><span>Target Dataset:</span> <strong>${activeDatasetName}</strong></div>
        <div class="meta-item"><span>Total Itemsets Mined:</span> <strong>${activeResults.totalFrequentItemsets}</strong></div>
        <div class="meta-item"><span>Minimum Support Threshold:</span> <strong>${(activeResults.stats?.frequentItems ? 'Custom' : 'Active')}</strong></div>
        <div class="meta-item"><span>Report Date:</span> <strong>${new Date().toLocaleDateString()}</strong></div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 50%;">Frequent Itemset</th>
            <th style="width: 15%;">Support Count</th>
            <th style="width: 20%;">Support %</th>
            <th style="width: 15%;">Mining Level</th>
          </tr>
        </thead>
        <tbody>
          ${activeResults.itemsets.map(item => `
            <tr>
              <td><code>${item.itemset.join(', ')}</code></td>
              <td><strong>${item.support}</strong></td>
              <td>
                <div class="progress-bg"><div class="progress-fg" style="width: ${item.supportPct * 100}%;"></div></div>
                <span style="font-family: monospace;">${(item.supportPct * 100).toFixed(1)}%</span>
              </td>
              <td><span class="badge">Level ${item.level}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
    openPrintWindow('Frequent Itemsets Report', content)
  }

  // Print Rules PDF
  const handlePrintRules = () => {
    if (!activeResults || !activeResults.associationRules) return
    const content = `
      <h1>Mined Association Rules</h1>
      <div class="meta-grid">
        <div class="meta-item"><span>Target Dataset:</span> <strong>${activeDatasetName}</strong></div>
        <div class="meta-item"><span>Total Rules Extracted:</span> <strong>${activeResults.totalRules}</strong></div>
        <div class="meta-item"><span>Mining Engine:</span> <strong>C++ DiffNodeset Subprocess</strong></div>
        <div class="meta-item"><span>Report Date:</span> <strong>${new Date().toLocaleDateString()}</strong></div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Antecedent</th>
            <th>Consequent</th>
            <th>Support</th>
            <th>Confidence</th>
            <th>Lift</th>
            <th>Leverage</th>
            <th>Conviction</th>
          </tr>
        </thead>
        <tbody>
          ${activeResults.associationRules.map(rule => `
            <tr>
              <td><code>${rule.antecedent.join(', ')}</code></td>
              <td><code>${rule.consequent.join(', ')}</code></td>
              <td><strong>${(rule.supportPct * 100).toFixed(1)}%</strong></td>
              <td><strong>${(rule.confidence * 100).toFixed(1)}%</strong></td>
              <td style="color: #059669; font-weight: bold;">${rule.lift.toFixed(2)}x</td>
              <td>${rule.leverage.toFixed(4)}</td>
              <td>${rule.conviction.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
    openPrintWindow('Association Rules Report', content)
  }

  // Print Executive Summary PDF
  const handlePrintExecutive = () => {
    if (!activeResults || !datasetDetails) return
    const ds = datasetDetails
    const stats = activeResults.stats
    
    const content = `
      <h1>HealthMart Platform Executive Report</h1>
      <div class="meta-grid">
        <div class="meta-item"><span>Active Dataset File:</span> <strong>${activeDatasetName}</strong></div>
        <div class="meta-item"><span>Total Parsed Rows:</span> <strong>${ds.rows.toLocaleString()} records</strong></div>
        <div class="meta-item"><span>Dataset Quality Grade:</span> <strong>${ds.health?.grade || 'N/A'} (${ds.health?.score || 0}% score)</strong></div>
        <div class="meta-item"><span>Mined Frequent Itemsets:</span> <strong>${activeResults.totalFrequentItemsets}</strong></div>
        <div class="meta-item"><span>Extracted Association Rules:</span> <strong>${activeResults.totalRules}</strong></div>
        <div class="meta-item"><span>C++ Execution Speed:</span> <strong>${activeResults.executionTime}</strong></div>
        <div class="meta-item"><span>Virtual Memory Allocation:</span> <strong>${activeResults.memoryUsage}</strong></div>
        <div class="meta-item"><span>Generation Timestamp:</span> <strong>${new Date().toLocaleString()}</strong></div>
      </div>

      <h2>DiffNodeset Execution Diagnostics</h2>
      <table>
        <thead>
          <tr>
            <th>Pipeline Stage</th>
            <th>Time Duration (ms)</th>
            <th>PPC Tree Complexity</th>
            <th>Candidate Intersections</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>File Loading & Parsing</td>
            <td>${stats.parseTimeMs.toFixed(2)} ms</td>
            <td>Total Tree Nodes: ${stats.treeNodeCount}</td>
            <td>Candidates Intersected: ${stats.candidatesCount}</td>
          </tr>
          <tr>
            <td>PPC Tree Building</td>
            <td>${stats.treeTimeMs.toFixed(2)} ms</td>
            <td>Max Tree Depth: ${stats.treeDepth}</td>
            <td>Candidates Pruned: ${stats.prunedCount}</td>
          </tr>
          <tr>
            <td>NodeSet 1-Itemsets Extract</td>
            <td>${stats.nodeSetTimeMs.toFixed(2)} ms</td>
            <td>NodeSets Count: ${stats.nodeSetCount}</td>
            <td>Max Level Depth: ${stats.maxLevel}</td>
          </tr>
          <tr>
            <td>DiffNodeset Joins & Mining</td>
            <td>${stats.diffNodeSetTimeMs.toFixed(2)} ms</td>
            <td>DiffNodeSets Mined: ${stats.diffNodeSetCount}</td>
            <td>Mining Efficiency: ${((stats.prunedCount / Math.max(1, stats.candidatesCount)) * 100).toFixed(1)}%</td>
          </tr>
        </tbody>
      </table>

      <h2>Top 8 Clinical Combinations</h2>
      <table>
        <thead>
          <tr>
            <th>Pattern Itemset</th>
            <th>Support Count</th>
            <th>Support Percentage</th>
            <th>Complexity Level</th>
          </tr>
        </thead>
        <tbody>
          ${activeResults.itemsets.slice(0, 8).map(item => `
            <tr>
              <td><code>${item.itemset.join(', ')}</code></td>
              <td>${item.support}</td>
              <td>
                <div class="progress-bg"><div class="progress-fg" style="width: ${item.supportPct * 100}%;"></div></div>
                <span style="font-family: monospace;">${(item.supportPct * 100).toFixed(1)}%</span>
              </td>
              <td><span class="badge">Level ${item.level}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2 style="page-break-before: always;">Top 8 Discovered Association Rules</h2>
      <table>
        <thead>
          <tr>
            <th>Antecedent</th>
            <th>Consequent</th>
            <th>Support %</th>
            <th>Confidence %</th>
            <th>Lift Correlation</th>
            <th>Leverage Impact</th>
          </tr>
        </thead>
        <tbody>
          ${activeResults.associationRules.slice(0, 8).map(rule => `
            <tr>
              <td><code>${rule.antecedent.join(', ')}</code></td>
              <td><code>${rule.consequent.join(', ')}</code></td>
              <td>${(rule.supportPct * 100).toFixed(1)}%</td>
              <td>${(rule.confidence * 100).toFixed(1)}%</td>
              <td style="color: #059669; font-weight: bold;">${rule.lift.toFixed(2)}x</td>
              <td>${rule.leverage.toFixed(4)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
    openPrintWindow('Platform Executive Summary Report', content)
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
        className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex items-center gap-4 shadow-sm"
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
          <h3 className="text-sm font-bold text-slate-800">Available Platform Exports</h3>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full font-bold">Standard Formats</span>
        </div>
        
        <div className="divide-y divide-slate-100">
          {activeResults ? (
            (() => {
              const user = JSON.parse(localStorage.getItem('hm_user') || '{"role":"viewer"}')
              const isAnalyst = user.role === 'analyst'
              
              return (
                <>
                  {/* Report 1: Frequent Itemsets */}
                  <div className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <Database className="w-4.5 h-4.5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 font-semibold">Frequent Itemsets Table</p>
                        <p className="text-[10px] text-slate-400">Dataset: {activeDatasetName} · {activeResults.totalFrequentItemsets} patterns</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrintItemsets}
                        disabled={isAnalyst}
                        title={isAnalyst ? "PDF generation is restricted to Admin role" : "Generate printable PDF"}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> PDF/Print
                      </button>
                      <button
                        onClick={exportItemsetsCSV}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> CSV
                      </button>
                    </div>
                  </div>

                  {/* Report 2: Association Rules */}
                  <div className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                        <Award className="w-4.5 h-4.5 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 font-semibold">Association Rules Table</p>
                        <p className="text-[10px] text-slate-400">Dataset: {activeDatasetName} · {activeResults.totalRules} rules</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrintRules}
                        disabled={isAnalyst}
                        title={isAnalyst ? "PDF generation is restricted to Admin role" : "Generate printable PDF"}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> PDF/Print
                      </button>
                      <button
                        onClick={exportRulesCSV}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> CSV
                      </button>
                    </div>
                  </div>

                  {/* Report 3: Print/PDF Summary */}
                  <div className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                        <FileText className="w-4.5 h-4.5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 font-semibold">Comprehensive Analytics Report</p>
                        <p className="text-[10px] text-slate-400">Generate executive PDF compilation of support curves and PPC diagnostics</p>
                      </div>
                    </div>
                    <button
                      onClick={handlePrintExecutive}
                      disabled={isAnalyst}
                      title={isAnalyst ? "PDF generation is restricted to Admin role" : "Generate printable PDF"}
                      className="flex items-center gap-1.5 px-4.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Generate PDF Report
                    </button>
                  </div>
                </>
              )
            })()
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
