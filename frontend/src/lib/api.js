export const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function summarize(docId) {
  const res = await fetch(`${API}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doc_id: docId })
  })
  if (!res.ok) throw new Error('Summarize failed')
  return res.json()
}

export async function explainClauses(docId) {
  const res = await fetch(`${API}/clauses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doc_id: docId })
  })
  if (!res.ok) throw new Error('Clauses failed')
  return res.json()
}

export async function ask(docId, question) {
  const res = await fetch(`${API}/qa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doc_id: docId, question })
  })
  if (!res.ok) throw new Error('QA failed')
  return res.json()
}


