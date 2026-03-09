import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../api/axios'

export default function LogWaste() {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const { data: menuItems } = useQuery({ queryKey: ['menu-items'], queryFn: () => api.get('/menu-items').then(r => r.data) })
  const { data: recent } = useQuery({ queryKey: ['waste-recent'], queryFn: () => api.get('/waste-logs?limit=10').then(r => r.data) })
  const cardStyle = { background: 'linear-gradient(135deg, rgba(26,22,48,0.9), rgba(19,16,42,0.95))', border: '1px solid rgba(139,92,246,0.15)' }

  const logMut = useMutation({
    mutationFn: data => api.post('/waste-logs', {
      meal: data.meal,
      menuItemId: data.menuItemId,
      menuItemName: (menuItems?.items || []).find(m => m._id === data.menuItemId)?.name || '',
      wastedKg: Number(data.wastedKg),
      preparedKg: Number(data.preparedKg),
    }),
    onSuccess: () => { toast.success('Waste logged!'); reset(); qc.invalidateQueries(['waste-recent']) },
    onError: err => toast.error(err.response?.data?.error || 'Failed'),
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-3xl font-bold text-primary">Log Waste</h1>
        <p className="text-muted text-sm mt-1">Record post-meal food waste for tracking and analytics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6" style={cardStyle}>
          <h3 className="font-display font-bold text-lg text-primary mb-5">New Waste Entry</h3>
          <form onSubmit={handleSubmit(data => logMut.mutate(data))} className="space-y-4">
            {[
              { label: 'Meal Service', name: 'meal', options: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'] },
            ].map(f => (
              <div key={f.name}>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">{f.label}</label>
                <div className="relative">
                  <select {...register(f.name, { required: true })} className="input-field w-full rounded-xl px-4 py-3 text-primary text-sm appearance-none">
                    {f.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                  <span className="absolute right-3 top-3.5 text-muted pointer-events-none text-xs">▼</span>
                </div>
              </div>
            ))}

            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Menu Item</label>
              <div className="relative">
                <select {...register('menuItemId', { required: true })} className="input-field w-full rounded-xl px-4 py-3 text-primary text-sm appearance-none">
                  <option value="">Select item...</option>
                  {(menuItems?.items || []).map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
                <span className="absolute right-3 top-3.5 text-muted pointer-events-none text-xs">▼</span>
              </div>
              {errors.menuItemId && <p className="text-red text-xs mt-1">Required</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Waste (kg)</label>
                <input {...register('wastedKg', { required: true, min: 0.1 })} type="number" step="0.1"
                  className="input-field w-full rounded-xl px-4 py-3 text-primary text-sm" placeholder="e.g. 5.5" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Prepared (kg)</label>
                <input {...register('preparedKg', { required: true, min: 0.1 })} type="number" step="0.1"
                  className="input-field w-full rounded-xl px-4 py-3 text-primary text-sm" placeholder="e.g. 50" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Notes (optional)</label>
              <textarea {...register('notes')} rows={2} className="input-field w-full rounded-xl px-4 py-3 text-primary text-sm resize-none" placeholder="Any observations..." />
            </div>

            <button type="submit" disabled={logMut.isPending} className="btn-accent w-full text-white font-bold py-4 rounded-xl text-sm">
              {logMut.isPending ? 'Logging...' : '📋 Log Waste Entry'}
            </button>
          </form>
        </div>

        <div className="rounded-2xl p-6" style={cardStyle}>
          <h3 className="font-display font-bold text-lg text-primary mb-5">Recent Entries</h3>
          <div className="space-y-3">
            {(recent?.logs || []).map((log, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(13,11,26,0.5)', border: '1px solid rgba(139,92,246,0.1)' }}>
                <div>
                  <p className="text-sm font-semibold text-primary">{log.menuItemId?.name || log.menuItemName}</p>
                  <p className="text-xs text-muted">{log.meal} · {new Date(log.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`font-mono font-bold text-sm ${log.wastedKg > 10 ? 'text-red' : log.wastedKg > 5 ? 'text-yellow' : 'text-green'}`}>{log.wastedKg} kg</span>
              </div>
            ))}
            {(!recent?.logs?.length) && <p className="text-muted text-sm text-center py-8">No recent entries</p>}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
