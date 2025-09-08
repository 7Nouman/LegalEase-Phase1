import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { API } from '../lib/api.js'

export function FileUpload({ onUploaded }) {
  const inputRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedName, setSelectedName] = useState('')

  useEffect(() => {
    const savedName = localStorage.getItem('legalease_doc_name') || ''
    if (savedName) setSelectedName(savedName)
  }, [])

  const handleSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a PDF file')
      return
    }
    setIsLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(API + '/upload', {
        method: 'POST',
        body: form
      })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      toast.success('Uploaded successfully')
      setSelectedName(file.name)
      try {
        localStorage.setItem('legalease_doc_id', data.doc_id)
        localStorage.setItem('legalease_doc_name', file.name)
      } catch {}
      onUploaded?.(data.doc_id)
    } catch (err) {
      console.error(err)
      toast.error('Failed to upload PDF')
    } finally {
      setIsLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="card p-6 flex items-center justify-between gap-4">
      <div>
        <div className="font-medium">Upload a legal PDF</div>
        <div className="text-sm text-slate-600">We extract text locally via the backend.</div>
        {selectedName && (
          <div className="mt-2 text-sm"><span className="badge border-brand-200 text-brand-800">Selected</span> <span className="text-slate-700">{selectedName}</span></div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <input ref={inputRef} onChange={handleSelect} type="file" accept="application/pdf" className="hidden" />
        <button className="btn btn-outline" onClick={() => inputRef.current?.click()} disabled={isLoading}>
          {isLoading ? 'Uploading…' : 'Choose PDF'}
        </button>
      </div>
    </div>
  )
}


