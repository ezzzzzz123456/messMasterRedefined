import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import api from '../../api/axios'

const cardStyle = {
  background: 'linear-gradient(135deg, rgba(26,22,48,0.9), rgba(19,16,42,0.95))',
  border: '1px solid rgba(139,92,246,0.15)',
}

function getClassByWaste(avgWaste) {
  if (avgWaste > 70) return 'critical'
  if (avgWaste > 40) return 'high'
  return 'normal'
}

function getBarStyle(avgWaste) {
  const level = getClassByWaste(avgWaste)
  if (level === 'critical') {
    return {
      background: 'linear-gradient(90deg, rgba(139,92,246,0.92), rgba(196,181,253,0.98))',
      boxShadow: '0 0 0 1px rgba(216,180,254,0.28), 0 0 26px rgba(167,139,250,0.34)',
      labelColor: '#f5f3ff',
      badge: 'Critical',
      badgeStyle: {
        background: 'rgba(167,139,250,0.2)',
        border: '1px solid rgba(216,180,254,0.3)',
        color: '#ede9fe',
      },
    }
  }
  if (level === 'high') {
    return {
      background: 'linear-gradient(90deg, rgba(124,58,237,0.9), rgba(167,139,250,0.94))',
      boxShadow: '0 0 0 1px rgba(139,92,246,0.24), 0 0 18px rgba(139,92,246,0.22)',
      labelColor: '#f5f3ff',
      badge: 'High',
      badgeStyle: {
        background: 'rgba(139,92,246,0.16)',
        border: '1px solid rgba(139,92,246,0.28)',
        color: '#ddd6fe',
      },
    }
  }
  return {
    background: 'linear-gradient(90deg, rgba(91,33,182,0.88), rgba(139,92,246,0.82))',
    boxShadow: '0 0 0 1px rgba(139,92,246,0.12)',
    labelColor: '#ede9fe',
    badge: 'Normal',
    badgeStyle: {
      background: 'rgba(91,33,182,0.12)',
      border: '1px solid rgba(139,92,246,0.16)',
      color: '#c4b5fd',
    },
  }
}

function WasteRow({ item, maxWaste, active, onEnter, onLeave, index }) {
  const percent = maxWaste > 0 ? Math.max(8, (item.avgWaste / maxWaste) * 100) : 8
  const barStyle = getBarStyle(item.avgWaste)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: index * 0.03 }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="rounded-2xl px-4 py-3 transition-colors"
      style={{ background: active ? 'rgba(255,255,255,0.05)' : 'transparent' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[220px,1fr] gap-3 lg:gap-5 items-center">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary truncate">{item.name}</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted mt-1">Average Waste</p>
          </div>
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={barStyle.badgeStyle}
          >
            {barStyle.badge}
          </span>
        </div>

        <div className="relative">
          <div className="h-11 rounded-full overflow-hidden" style={{ background: 'rgba(139,92,246,0.09)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="h-full rounded-full flex items-center justify-end px-4"
              style={{
                background: barStyle.background,
                boxShadow: barStyle.boxShadow,
              }}
            >
              <span className="text-sm font-semibold whitespace-nowrap" style={{ color: barStyle.labelColor }}>
                {item.avgWaste.toFixed(1)} kg
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function MenuAnalysis() {
  const { data } = useQuery({
    queryKey: ['menu-correlation'],
    queryFn: () => api.get('/menu-items/correlation').then((r) => r.data),
    refetchInterval: 10000,
  })
  const [activeRow, setActiveRow] = useState(null)

  const chartData = useMemo(
    () =>
      (data?.items || [])
        .map((item) => ({
          name: item.name,
          avgWaste: parseFloat(item.avgWaste?.toFixed(1) || 0),
          risk: item.riskScore,
        }))
        .sort((a, b) => b.avgWaste - a.avgWaste)
        .slice(0, 10),
    [data?.items],
  )

  const maxWaste = chartData.reduce((max, item) => Math.max(max, item.avgWaste), 0)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-primary">Menu Analysis</h1>
        <p className="text-muted text-sm mt-1">Waste correlation by menu item</p>
      </div>

      <div className="rounded-2xl p-6" style={cardStyle}>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="font-display font-bold text-lg text-primary">Average Waste by Dish (kg)</h3>
            <p className="text-xs text-muted mt-1">Inline values are shown directly on each dish row for faster scanning.</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Top Reference</p>
            <p className="text-sm font-semibold text-accent-bright mt-1">{maxWaste.toFixed(1)} kg</p>
          </div>
        </div>

        <div className="space-y-2">
          {chartData.map((item, index) => (
            <WasteRow
              key={item.name}
              item={item}
              maxWaste={maxWaste}
              active={activeRow === item.name}
              onEnter={() => setActiveRow(item.name)}
              onLeave={() => setActiveRow(null)}
              index={index}
            />
          ))}
          {!chartData.length && (
            <div className="rounded-2xl px-4 py-10 text-center text-sm text-muted" style={{ background: 'rgba(139,92,246,0.05)' }}>
              No menu analysis data available yet.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Critical Risk (>70)', count: chartData.filter((d) => getClassByWaste(d.avgWaste) === 'critical').length, color: '#c4b5fd' },
          { label: 'High Risk (40-70)', count: chartData.filter((d) => getClassByWaste(d.avgWaste) === 'high').length, color: '#a78bfa' },
          { label: 'Normal (<=40)', count: chartData.filter((d) => getClassByWaste(d.avgWaste) === 'normal').length, color: '#8b5cf6' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-5 text-center" style={cardStyle}>
            <p className="text-3xl font-display font-bold mb-1" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
