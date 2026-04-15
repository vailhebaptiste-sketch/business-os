'use client'

import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useStore } from '@/lib/store'
import {
  Bot, X, Send, Loader2, Sparkles,
  RotateCcw, ChevronDown, AlertCircle,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ─── Markdown léger ───────────────────────────────────────────────────────────

function renderMarkdown(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []

  lines.forEach((line, i) => {
    if (line.startsWith('### ')) {
      elements.push(<p key={i} className="font-semibold text-gray-900 mt-2 mb-0.5">{line.slice(4)}</p>)
    } else if (line.startsWith('## ')) {
      elements.push(<p key={i} className="font-bold text-gray-900 mt-2 mb-1">{line.slice(3)}</p>)
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <div key={i} className="flex gap-1.5 my-0.5">
          <span className="text-blue-500 mt-0.5 shrink-0">•</span>
          <span>{formatInline(line.slice(2))}</span>
        </div>
      )
    } else if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\./)?.[1]
      elements.push(
        <div key={i} className="flex gap-1.5 my-0.5">
          <span className="text-blue-500 shrink-0 font-medium">{num}.</span>
          <span>{formatInline(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      )
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1.5" />)
    } else {
      elements.push(<p key={i} className="my-0.5 leading-relaxed">{formatInline(line)}</p>)
    }
  })

  return <div className="text-sm text-gray-800">{elements}</div>
}

function formatInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-gray-100 text-blue-700 px-1 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>
    }
    return part
  })
}

// ─── Suggestions rapides ──────────────────────────────────────────────────────

const SUGGESTIONS = [
  'Comment créer un devis ?',
  'Comment ajouter un client ?',
  'Explique les statuts des missions',
  'Comment inviter un collaborateur ?',
  'Je rencontre un bug, aide-moi',
]

// ─── Composant principal ──────────────────────────────────────────────────────

export function AiAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pathname = usePathname()
  const { clients, missions, devis } = useStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const context = {
    page: pathname?.replace('/dashboard/', '').replace('/dashboard', 'Dashboard') || 'Dashboard',
    clientsCount: clients.length,
    missionsCount: missions.filter(m => m.statut === 'en_cours' || m.statut === 'nouveau').length,
    devisCount: devis.filter(d => d.statut === 'envoye').length,
  }

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMsg: Message = { id: uid(), role: 'user', content: text.trim() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated.map(m => ({ role: m.role, content: m.content })),
          context,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || `Erreur ${res.status}`)
      } else {
        const assistantMsg: Message = { id: uid(), role: 'assistant', content: data.text }
        setMessages(prev => [...prev, assistantMsg])
      }
    } catch {
      setError('Impossible de contacter l\'assistant. Vérifiez votre connexion.')
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading, context])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    sendMessage(input)
  }

  function handleSuggestion(text: string) {
    sendMessage(text)
  }

  return (
    <>
      {/* ── Bouton flottant ─────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`
          fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40
          w-12 h-12 rounded-full shadow-lg transition-all duration-200
          flex items-center justify-center
          ${open
            ? 'bg-gray-700 hover:bg-gray-800'
            : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
          }
        `}
        aria-label="Assistant IA"
      >
        {open
          ? <ChevronDown className="w-5 h-5 text-white" />
          : <Sparkles className="w-5 h-5 text-white" />
        }
      </button>

      {/* ── Panneau chat ────────────────────────────────────────────────── */}
      {open && (
        <div className="
          fixed bottom-36 right-4 md:bottom-20 md:right-6 z-40
          w-[calc(100vw-2rem)] max-w-sm
          bg-white rounded-2xl shadow-2xl border border-gray-200
          flex flex-col overflow-hidden
        " style={{ height: '480px' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-none">Assistant IA</p>
                <p className="text-blue-200 text-xs mt-0.5">Business OS</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={() => { setMessages([]); setError(null) }}
                  className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  title="Nouvelle conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">

            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-3 py-2.5 text-sm text-gray-700 leading-relaxed">
                    Bonjour ! Je suis votre assistant Business OS. Je peux vous aider à utiliser l&apos;application, rédiger des devis, ou répondre à vos questions.
                  </div>
                </div>
                <div className="space-y-1.5 pl-8">
                  <p className="text-xs text-gray-400 font-medium">Suggestions :</p>
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => handleSuggestion(s)}
                      disabled={isLoading}
                      className="block w-full text-left text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl px-3 py-2 transition-colors border border-blue-100 disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                )}
                <div className={`
                  max-w-[85%] rounded-2xl px-3 py-2.5
                  ${m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-gray-50 rounded-tl-sm'
                  }
                `}>
                  {m.role === 'user'
                    ? <p className="text-sm leading-relaxed">{m.content}</p>
                    : renderMarkdown(m.content)
                  }
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-3 py-2.5">
                  <div className="flex gap-1 items-center h-5">
                    {[0, 150, 300].map(d => (
                      <div
                        key={d}
                        className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-xs text-red-600">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 pb-3 shrink-0">
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition-all"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Posez votre question..."
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-7 h-7 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 rounded-lg flex items-center justify-center transition-colors shrink-0"
              >
                {isLoading
                  ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                  : <Send className="w-3.5 h-3.5 text-white" />
                }
              </button>
            </form>
            <p className="text-center text-xs text-gray-400 mt-1.5">Propulsé par Claude · Anthropic</p>
          </div>
        </div>
      )}
    </>
  )
}
