import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, CartesianGrid } from 'recharts'
import api from '../../api/axios'
import useAuthStore from '../../store/useAuthStore'
import KPICard from '../../components/ui/KPICard'
import Badge from '../../components/ui/Badge'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl p-3 text-xs" style={{ background: '#1a1630', border: '1px solid rgba(139,92,246,0.3)' }}>
      <p className="text-muted mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value} kg</p>
      ))}
    </div>
  )
}

export default function Overview() {
  const { user } = useAuthStore()

  const { data: kpis } = useQuery({
    queryKey: ['overview'],
    queryFn: () => api.get('/analytics/overview').then(r => r.data),
  })
  const { data: trend } = useQuery({
    queryKey: ['waste-trend'],
    queryFn: () => api.get('/analytics/waste-trend').then(r => r.data),
    refetchInterval: 10000,
  })
  const { data: insights } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: () => api.get('/analytics/ai-insights').then(r => r.data),
  })
  const { data: mealData } = useQuery({
    queryKey: ['meal-breakdown'],
    queryFn: () => api.get('/waste-logs/by-meal').then(r => r.data),
  })
  const { data: recentLogs } = useQuery({
    queryKey: ['recent-logs'],
    queryFn: () => api.get('/waste-logs?limit=5').then(r => r.data),
  })

  const trendFormatted = trend?.map(d => ({
    date: d._id,
    wasted: parseFloat(d.wastedKg?.toFixed(1) || 0),
    prepared: parseFloat(d.preparedKg?.toFixed(1) || 0),
  })) || []

  const radarData = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(meal => ({
    meal, waste: parseFloat(mealData?.find(m => m._id === meal)?.avgWaste?.toFixed(1) || 0),
  }))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard label="Food Waste (7d)" value={kpis?.totalWasteKg || 0} unit="kg" delta={-12} deltaLabel="vs previous week" icon="🗑️" color="red" />
        <KPICard label="Cost Loss (7d)" value={kpis?.totalCostLoss || 0} unit="₹" delta={4.5} deltaLabel="vs previous week" icon="💸" color="accent" />
        <KPICard label="CO₂ Saved" value={kpis?.totalCo2Kg || 185} unit="kg" icon="🌿" color="green" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trend Chart */}
        <div className="lg:col-span-2 rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, rgba(26,22,48,0.9), rgba(19,16,42,0.95))', border: '1px solid rgba(139,92,246,0.15)' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-lg text-primary">Wastage Trends (Actual Data)</h3>
            <div className="flex items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent-light" />Actual</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: '#38bdf8' }} />Prepared</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendFormatted} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="wasted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="predicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" stroke="#6b6490" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b6490" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="wasted" stroke="#a78bfa" fill="url(#wasted)" strokeWidth={2} name="Wasted" />
              <Area type="monotone" dataKey="prepared" stroke="#38bdf8" fill="url(#predicted)" strokeWidth={2} strokeDasharray="4 4" name="Prepared" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Inventory Alerts */}
        <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, rgba(26,22,48,0.9), rgba(19,16,42,0.95))', border: '1px solid rgba(139,92,246,0.15)' }}>
          <div className="flex items-center gap-2 mb-5">
            <h3 className="font-display font-bold text-lg text-primary">Live Inventory Alerts</h3>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red"></span>
            </span>
          </div>
          <div className="space-y-3">
            {[
              { type: 'red', label: 'Low Stock: Milk', desc: 'Only 15L remaining. Restock before dinner.' },
              { type: 'yellow', label: 'Expiring Soon: Bread', desc: '40 loaves expiring tomorrow.' },
              { type: 'blue', label: 'New Shipment', desc: 'Rice sacks (500kg) arriving at 2 PM.' },
            ].map((a, i) => (
              <div key={i} className="p-3 rounded-xl flex gap-3 items-start transition-colors"
                style={{ background: `rgba(${a.type === 'red' ? '239,68,68' : a.type === 'yellow' ? '245,158,11' : '56,189,248'},0.05)`, borderLeft: `2px solid ${a.type === 'red' ? '#ef4444' : a.type === 'yellow' ? '#f59e0b' : '#38bdf8'}` }}>
                <span className="text-base">{a.type === 'red' ? '⚠️' : a.type === 'yellow' ? '⏱️' : '🚚'}</span>
                <div>
                  <p className="text-sm font-semibold text-primary">{a.label}</p>
                  <p className="text-xs text-muted mt-0.5">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Waste Logs */}
        <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, rgba(26,22,48,0.9), rgba(19,16,42,0.95))', border: '1px solid rgba(139,92,246,0.15)' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-lg text-primary">Recent Waste Logs</h3>
            <a href="/dashboard/log-waste" className="text-xs font-semibold text-accent-bright hover:text-accent-light transition-colors">View All →</a>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-muted uppercase tracking-wider">
                <th className="pb-3 font-semibold">Meal</th>
                <th className="pb-3 font-semibold">Item</th>
                <th className="pb-3 font-semibold text-right">Qty (kg)</th>
                <th className="pb-3 font-semibold text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {(recentLogs?.logs || [
                { meal: 'Lunch', menuItemName: 'Rice', wastedKg: 12.5, createdAt: '2024-01-01T14:30:00' },
                { meal: 'Lunch', menuItemName: 'Dal Fry', wastedKg: 8.2, createdAt: '2024-01-01T14:35:00' },
                { meal: 'Breakfast', menuItemName: 'Upma', wastedKg: 2.1, createdAt: '2024-01-01T10:15:00' },
              ]).slice(0, 5).map((log, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 font-medium text-primary">{log.meal}</td>
                  <td className="py-3 text-muted">{log.menuItemId?.name || log.menuItemName || log.item}</td>
                  <td className={`py-3 text-right font-mono font-medium ${log.wastedKg > 10 ? 'text-red' : log.wastedKg > 5 ? 'text-yellow' : 'text-green'}`}>{log.wastedKg}</td>
                  <td className="py-3 text-right text-xs text-muted font-mono">{new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, rgba(26,22,48,0.9), rgba(19,16,42,0.95))', border: '1px solid rgba(139,92,246,0.15)' }}>
          <h3 className="font-display font-bold text-lg text-primary mb-5">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Log Waste', icon: '📋', path: '/dashboard/log-waste', color: 'accent' },
              { label: 'Edit Menu', icon: '📅', path: '/dashboard/setup', color: 'blue' },
              { label: 'Order Stock', icon: '📦', path: '/dashboard/inventory', color: 'pink' },
              { label: 'Reports', icon: '📊', path: '/dashboard/menu-analysis', color: 'green' },
            ].map(a => (
              <a key={a.label} href={a.path}
                className="flex flex-col items-center justify-center p-5 rounded-xl border border-border/50 hover:border-accent/30 transition-all group cursor-pointer"
                style={{ background: 'rgba(13,11,26,0.5)' }}>
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{a.icon}</span>
                <span className="text-sm font-semibold text-muted group-hover:text-primary transition-colors">{a.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      {insights?.length > 0 && (
        <div>
          <h3 className="font-display font-bold text-lg text-primary mb-4">AI Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl p-4 flex items-start gap-3"
                style={{ background: 'rgba(26,22,48,0.8)', border: '1px solid rgba(139,92,246,0.15)' }}>
                <span className="text-2xl">{insight.icon}</span>
                <div>
                  <Badge color={insight.severity} className="mb-1">{insight.severity?.toUpperCase()}</Badge>
                  <p className="text-sm text-primary mt-1">{insight.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
