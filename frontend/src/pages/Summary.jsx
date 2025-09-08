import { useEffect, useState } from 'react'
import { FileUpload } from '../components/FileUpload.jsx'
import { summarize } from '../lib/api.js'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export function Summary() {
  const [docId, setDocId] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('legalease_doc_id')
    if (saved) setDocId(saved)
  }, [])

  const handleSummarize = async () => {
    if (!docId) return toast.error('Upload a PDF first')
    setLoading(true)
    try {
      const data = await summarize(docId)
      setResult(data.summary)
    } catch (e) {
      toast.error('Failed to summarize')
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
            <div className="font-semibold">Summary</div>
            <div className="text-sm text-slate-600">One-liner + 3 bullets</div>
          </div>
          <button className="btn btn-primary" onClick={handleSummarize} disabled={loading}>
            {loading ? 'Summarizing…' : 'Generate Summary'}
          </button>
        </div>
        {!result ? (
          <div className="text-slate-500 text-sm">No summary yet.</div>
        ) : (
          <motion.pre
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="whitespace-pre-wrap text-sm leading-6"
          >{result}</motion.pre>
        )}
      </div>
    </div>
  )
}


