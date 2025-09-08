import { useEffect, useState } from 'react'
import { FileUpload } from '../components/FileUpload.jsx'
import { ask } from '../lib/api.js'
import { toast } from 'sonner'

export function Chat() {
  const [docId, setDocId] = useState(null)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('legalease_doc_id')
    if (saved) setDocId(saved)
  }, [])

  const handleAsk = async () => {
    if (!docId) return toast.error('Upload a PDF first')
    if (!question.trim()) return
    const q = question.trim()
    setMessages((m) => [...m, { role: 'user', content: q }])
    setQuestion('')
    setLoading(true)
    try {
      const data = await ask(docId, q)
      setMessages((m) => [...m, { role: 'assistant', content: data.answer }])
    } catch (e) {
      toast.error('Failed to answer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <FileUpload onUploaded={setDocId} />
      <div className="card p-6">
        <div className="font-semibold mb-3">Chat about this document</div>
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
          {!messages.length && <div className="text-slate-500 text-sm">No messages yet.</div>}
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
              <div className={`inline-block px-3 py-2 rounded-xl text-sm ${m.role==='user'?'bg-brand-600 text-white':'bg-slate-100'}`}>{m.content}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="Ask a question..."
            value={question}
            onChange={(e)=>setQuestion(e.target.value)}
            onKeyDown={(e)=>{ if(e.key==='Enter') handleAsk() }}
          />
          <button className="btn btn-primary" onClick={handleAsk} disabled={loading}>{loading?'Thinking…':'Send'}</button>
        </div>
      </div>
    </div>
  )
}


