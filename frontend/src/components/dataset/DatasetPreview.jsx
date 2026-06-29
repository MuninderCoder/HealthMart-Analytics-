import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, X, ChevronUp, ChevronDown, ChevronsUpDown,
  ChevronLeft, ChevronRight, Table2
} from 'lucide-react'
import LoadingSkeleton from './LoadingSkeleton'
import EmptyState from './EmptyState'

const PAGE_SIZE = 20

function SortIcon({ col, sortConfig }) {
  if (sortConfig.col !== col) return <ChevronsUpDown className="w-3 h-3 opacity-30" />
  return sortConfig.dir === 'asc'
    ? <ChevronUp className="w-3 h-3 text-blue-500" />
    : <ChevronDown className="w-3 h-3 text-blue-500" />
}

export default function DatasetPreview({ data = [], columns = [], filename, status }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState({ col: null, dir: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)

  const handleSort = useCallback((col) => {
    setSortConfig((prev) => ({
      col,
      dir: prev.col === col && prev.dir === 'asc' ? 'desc' : 'asc',
    }))
    setCurrentPage(1)
  }, [])

  const handleSearch = useCallback((q) => {
    setSearchQuery(q)
    setCurrentPage(1)
  }, [])

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data
    const q = searchQuery.toLowerCase()
    return data.filter((row) =>
      columns.some((col) => String(row[col] ?? '').toLowerCase().includes(q))
    )
  }, [data, columns, searchQuery])

  const sortedData = useMemo(() => {
    if (!sortConfig.col) return filteredData
    return [...filteredData].sort((a, b) => {
      const aVal = String(a[sortConfig.col] ?? '')
      const bVal = String(b[sortConfig.col] ?? '')
      const cmp = aVal.localeCompare(bVal, undefined, { numeric: true, sensitivity: 'base' })
      return sortConfig.dir === 'asc' ? cmp : -cmp
    })
  }, [filteredData, sortConfig])

  const totalPages = Math.max(1, Math.ceil(sortedData.length / PAGE_SIZE))
  const pageClamped = Math.min(currentPage, totalPages)
  const pageRows = sortedData.slice((pageClamped - 1) * PAGE_SIZE, pageClamped * PAGE_SIZE)

  // Loading skeleton
  if (status === 'parsing') {
    return <LoadingSkeleton rows={8} cols={Math.min(columns.length || 6, 6)} />
  }

  // Empty state
  if (status !== 'ready' || data.length === 0) {
    return (
      <EmptyState
        icon={Table2}
        title="No dataset loaded"
        description="Upload a CSV or Excel file to see your data here."
      />
    )
  }

  // Page range label
  const startRow = (pageClamped - 1) * PAGE_SIZE + 1
  const endRow = Math.min(pageClamped * PAGE_SIZE, sortedData.length)

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search across all columns…"
            aria-label="Search dataset rows"
            className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
          {searchQuery && filteredData.length !== data.length && (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg font-medium">
              {filteredData.length.toLocaleString()} match{filteredData.length !== 1 ? 'es' : ''}
            </span>
          )}
          <span>{data.length.toLocaleString()} total rows · {columns.length} columns</span>
          {sortConfig.col && (
            <button
              onClick={() => setSortConfig({ col: null, dir: 'asc' })}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-2.5 h-2.5" /> Clear sort
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-xs" role="table" aria-label="Dataset preview">
          <thead>
            <tr className="bg-slate-900 text-slate-300">
              <th className="w-10 px-3 py-3 text-center font-semibold text-slate-500 border-b border-slate-700 sticky left-0 bg-slate-900">
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left font-semibold whitespace-nowrap border-b border-slate-700 cursor-pointer select-none hover:bg-slate-800 transition-colors group"
                  onClick={() => handleSort(col)}
                  aria-sort={
                    sortConfig.col === col
                      ? sortConfig.dir === 'asc' ? 'ascending' : 'descending'
                      : 'none'
                  }
                >
                  <div className="flex items-center gap-1.5">
                    <span className="truncate max-w-[140px]">{col}</span>
                    <SortIcon col={col} sortConfig={sortConfig} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {pageRows.map((row, rowIdx) => (
                <motion.tr
                  key={`${pageClamped}-${rowIdx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: rowIdx * 0.02 }}
                  className="hover:bg-blue-50/40 transition-colors border-b border-slate-100 last:border-0 group"
                >
                  <td className="px-3 py-2.5 text-center text-[10px] font-mono text-slate-400 bg-slate-50/50 border-r border-slate-100 sticky left-0">
                    {(pageClamped - 1) * PAGE_SIZE + rowIdx + 1}
                  </td>
                  {columns.map((col) => {
                    const val = row[col]
                    const isEmpty = val === null || val === undefined || String(val).trim() === ''
                    return (
                      <td
                        key={col}
                        className="px-4 py-2.5 whitespace-nowrap max-w-[200px]"
                        title={isEmpty ? '' : String(val)}
                      >
                        {isEmpty ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-400 bg-slate-100 border border-slate-200">
                            NULL
                          </span>
                        ) : (
                          <span className="text-slate-700 truncate block">
                            {String(val).length > 40 ? String(val).slice(0, 38) + '…' : String(val)}
                          </span>
                        )}
                      </td>
                    )
                  })}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {/* No search results */}
        {sortedData.length === 0 && searchQuery && (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-slate-500">No rows match "{searchQuery}"</p>
            <button
              onClick={() => handleSearch('')}
              className="mt-2 text-xs text-blue-600 hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Showing rows <span className="font-semibold text-slate-700">{startRow.toLocaleString()}–{endRow.toLocaleString()}</span> of{' '}
            <span className="font-semibold text-slate-700">{sortedData.length.toLocaleString()}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <button
              disabled={pageClamped === 1}
              onClick={() => setCurrentPage(pageClamped - 1)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let page
              if (totalPages <= 7) {
                page = i + 1
              } else if (pageClamped <= 4) {
                page = i + 1
                if (i === 6) page = totalPages
                if (i === 5) return <span key="e1" className="px-1 text-slate-300">…</span>
              } else if (pageClamped >= totalPages - 3) {
                page = i === 0 ? 1 : (i === 1 ? null : totalPages - (6 - i))
                if (i === 1) return <span key="e2" className="px-1 text-slate-300">…</span>
              } else {
                const pages = [1, null, pageClamped - 1, pageClamped, pageClamped + 1, null, totalPages]
                if (pages[i] === null) return <span key={`e${i}`} className="px-1 text-slate-300">…</span>
                page = pages[i]
              }
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                    pageClamped === page
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                  aria-current={pageClamped === page ? 'page' : undefined}
                >
                  {page}
                </button>
              )
            })}

            <button
              disabled={pageClamped === totalPages}
              onClick={() => setCurrentPage(pageClamped + 1)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
