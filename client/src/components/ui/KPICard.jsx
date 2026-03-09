import { useEffect, useRef } from 'react'

export default function KPICard({ label, value, unit = '', delta, deltaLabel, icon, color = 'accent' }) {
  const numRef = useRef(null)
  const colorMap = {
    accent: { text: '#a78bfa', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)' },
    green:  { text: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
    red:    { text: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)' },
    blue:   { text: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.25)' },
    pink:   { text: '#ec4899', bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.25)' },
  }
  const c = colorMap[color] || colorMap.accent

  useEffect(() => {
    const el = numRef.current
    if (!el || typeof value !== 'number') return
    let start = 0
    const end = value
    const duration = 1200
    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      el.textContent = (end % 1 === 0 ? Math.round(eased * end) : (eased * end).toFixed(1)).toString()
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value])

  return (
    <div className="rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:scale-[1.02]"
      style={{ background: `linear-gradient(135deg, ${c.bg} 0%, rgba(19,16,42,0.8) 100%)`, border: `1px solid ${c.border}` }}>
      <div className="absolute top-0 right-0 p-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: c.bg, border: `1px solid ${c.border}` }}>
          {icon}
        </div>
      </div>

      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">{label}</p>
      <div className="flex items-baseline gap-1.5 mb-3">
        <span ref={numRef} className="font-display text-4xl font-bold count-up" style={{ color: c.text }}>
          {typeof value === 'number' ? '0' : value}
        </span>
        {unit && <span className="text-muted text-sm font-medium">{unit}</span>}
      </div>

      {delta !== undefined && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"
            style={{
              background: delta < 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              color: delta < 0 ? '#10b981' : '#ef4444',
              border: `1px solid ${delta < 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
            }}>
            {delta < 0 ? '↓' : '↑'} {Math.abs(delta)}%
          </span>
          {deltaLabel && <span className="text-xs text-muted">{deltaLabel}</span>}
        </div>
      )}
    </div>
  )
}
