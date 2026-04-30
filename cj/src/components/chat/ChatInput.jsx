import { useState, useRef, useEffect } from 'react'
import { Send, Mic } from 'lucide-react'

export default function ChatInput({ onSend, disabled, placeholder = 'Ask anything about Jaipur…' }) {
  const [val, setVal] = useState('')
  const ref = useRef()

  const send = () => {
    const t = val.trim()
    if (!t || disabled) return
    onSend(t)
    setVal('')
    ref.current?.focus()
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="flex items-end gap-2 bg-white border border-border rounded-2xl px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <textarea
        ref={ref}
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={onKey}
        disabled={disabled}
        placeholder={placeholder}
        rows={1}
        className="flex-1 resize-none bg-transparent text-sm text-ink placeholder:text-ink-faint outline-none leading-relaxed py-1 max-h-28"
        style={{ overflowY: val.split('\n').length > 3 ? 'auto' : 'hidden' }}
      />
      <button
        onClick={send}
        disabled={!val.trim() || disabled}
        className="shrink-0 w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white disabled:opacity-40 hover:bg-primary-dark transition-colors"
      >
        <Send size={13} />
      </button>
    </div>
  )
}
