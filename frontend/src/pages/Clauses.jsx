import { useEffect, useState } from 'react'
import { FileUpload } from '../components/FileUpload.jsx'
import { explainClauses } from '../lib/api.js'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

function RiskBadge({ text }) {
  let color = 'border-slate-200 text-slate-700'
  if (text.includes('🟢')) color = 'border-emerald-200 text-emerald-700'
  if (text.includes('🟡')) color = 'border-amber-200 text-amber-800'
  if (text.includes('🔴')) color = 'border-red-200 text-red-700'
  return <span className={`badge ${color}`}>{text.split('—')[0]}</span>
}

export function Clauses() {
  const [docId, setDocId] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('legalease_doc_id')
    if (saved) setDocId(saved)
  }, [])

  const handleExplain = async () => {
    if (!docId) return toast.error('Upload a PDF first')
    setLoading(true)
    try {
      const data = await explainClauses(docId)
      setItems(data.clauses || [])
    } catch (e) {
      toast.error('Failed to analyze clauses')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <FileUpload onUploaded={setDocId} />
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold">Clauses</div>
            <div className="text-sm text-slate-600">Plain-English explanations + risk</div>
          </div>
          <button className="btn btn-primary" onClick={handleExplain} disabled={loading}>
            {loading ? 'Analyzing…' : 'Analyze Clauses'}
          </button>
        </div>
        {!items.length ? (
          <div className="text-slate-500 text-sm">No analysis yet.</div>
        ) : (
          <div className="space-y-4">
            {items.map((it, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl border border-slate-100 bg-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-slate-800 truncate">Clause {idx + 1}</div>
                  <RiskBadge text={it.analysis || ''} />
                </div>
                <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{it.analysis}</div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


