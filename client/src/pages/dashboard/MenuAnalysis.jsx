import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../../api/axios'

export default function MenuAnalysis() {
  const { data } = useQuery({
    queryKey: ['menu-correlation'],
    queryFn: () => api.get('/menu-items/correlation').then(r => r.data),
    refetchInterval: 10000,
  })
  const cardStyle = { background: 'linear-gradient(135deg, rgba(26,22,48,0.9), rgba(19,16,42,0.95))', border: '1px solid rgba(139,92,246,0.15)' }

  const chartData = (data?.items || []).map(item => ({
    name: item.name,
    avgWaste: parseFloat(item.avgWaste?.toFixed(1) || 0),
    risk: item.riskScore,
  })).sort((a, b) => b.avgWaste - a.avgWaste).slice(0, 10)

  const getClassByWaste = (avgWaste) => {
    if (avgWaste > 70) return 'critical'
    if (avgWaste > 40) return 'high'
    return 'normal'
  }
  const getColor = (avgWaste) => {
    const cls = getClassByWaste(avgWaste)
    if (cls === 'critical') return '#ef4444'
    if (cls === 'high') return '#f59e0b'
    return '#8b5cf6'
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="rounded-xl p-3 text-xs" style={{ background: '#1a1630', border: '1px solid rgba(139,92,246,0.3)' }}>
        <p className="text-primary font-semibold mb-1">{label}</p>
        <p className="text-muted">Avg Waste: <span className="text-accent-bright">{payload[0]?.value} kg</span></p>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-primary">Menu Analysis</h1>
        <p className="text-muted text-sm mt-1">Waste correlation by menu item</p>
      </div>

      <div className="rounded-2xl p-6" style={cardStyle}>
        <h3 className="font-display font-bold text-lg text-primary mb-6">Average Waste by Dish (kg)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
            <XAxis type="number" stroke="#6b6490" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" stroke="#6b6490" tick={{ fontSize: 11, fill: '#6b6490' }} tickLine={false} axisLine={false} width={110} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139,92,246,0.05)' }} />
            <Bar dataKey="avgWaste" radius={[0, 6, 6, 0]}>
              {chartData.map((entry, i) => <Cell key={i} fill={getColor(entry.avgWaste)} fillOpacity={0.8} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Critical Risk (>70)', count: chartData.filter(d => getClassByWaste(d.avgWaste) === 'critical').length, color: 'red' },
          { label: 'High Risk (40-70)', count: chartData.filter(d => getClassByWaste(d.avgWaste) === 'high').length, color: 'yellow' },
          { label: 'Normal (<=40)', count: chartData.filter(d => getClassByWaste(d.avgWaste) === 'normal').length, color: 'accent' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5 text-center" style={cardStyle}>
            <p className="text-3xl font-display font-bold mb-1" style={{ color: s.color === 'red' ? '#ef4444' : s.color === 'yellow' ? '#f59e0b' : '#a78bfa' }}>{s.count}</p>
            <p className="text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
