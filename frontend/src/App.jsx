import { NavLink, Route, Routes } from 'react-router-dom'
import { Summary } from './pages/Summary.jsx'
import { Clauses } from './pages/Clauses.jsx'
import { Chat } from './pages/Chat.jsx'
import { Toaster } from 'sonner'

export default function App() {
  return (
    <div className="min-h-screen">
      <Toaster position="top-right" richColors />
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-brand-600" />
            <span className="font-semibold text-lg">LegalEase AI</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <NavLink className={({isActive})=>isActive? 'text-brand-700' : 'text-slate-600 hover:text-slate-900'} to="/">Summary</NavLink>
            <NavLink className={({isActive})=>isActive? 'text-brand-700' : 'text-slate-600 hover:text-slate-900'} to="/clauses">Clauses</NavLink>
            <NavLink className={({isActive})=>isActive? 'text-brand-700' : 'text-slate-600 hover:text-slate-900'} to="/chat">Chat</NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Routes>
          <Route path="/" element={<Summary />} />
          <Route path="/clauses" element={<Clauses />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </main>
      <footer className="py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="card p-4 text-sm text-slate-600">
            ⚠️ Not legal advice. This tool is a prototype for educational purposes.
          </div>
        </div>
      </footer>
    </div>
  )
}


