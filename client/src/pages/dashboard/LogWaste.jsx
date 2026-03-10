import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { invalidateWasteQueries } from '../../utils/wasteLog'

const defaultValues = {
  meal: 'Breakfast',
  menuItemId: '',
  wastedKg: '',
  preparedKg: '',
  notes: '',
}

function RecentEntryCard({ log, onEdit, onDelete, deleting }) {
  const wasteColor =
    log.wastedKg > 10 ? 'text-red' : log.wastedKg > 5 ? 'text-yellow' : 'text-green'

  return (
    <div
      className="p-3 rounded-xl"
      style={{ background: 'rgba(13,11,26,0.5)', border: '1px solid rgba(139,92,246,0.1)' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">{log.menuItemId?.name || log.menuItemName}</p>
          <p className="text-xs text-muted">
            {log.meal} · {new Date(log.createdAt || log.date).toLocaleDateString()}
          </p>
        </div>
        <span className={`font-mono font-bold text-sm ${wasteColor}`}>{log.wastedKg} kg</span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onEdit(log)}
          className="text-xs px-3 py-1.5 rounded-lg border border-accent/30 text-accent-bright hover:bg-accent/10 transition-colors"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(log)}
          disabled={deleting}
          className="text-xs px-3 py-1.5 rounded-lg border border-red/30 text-red hover:bg-red/10 transition-colors disabled:opacity-60"
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  )
}

export default function LogWaste({ embedded = false, onLogged, editingLog = null, onEditCleared }) {
  const qc = useQueryClient()
  const [localEditingLog, setLocalEditingLog] = useState(null)
  const activeEditingLog = embedded ? editingLog : localEditingLog

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues })

  const { data: menuItems } = useQuery({
    queryKey: ['menu-items'],
    queryFn: () => api.get('/menu-items').then((r) => r.data),
  })
  const { data: recent } = useQuery({
    queryKey: ['waste-recent'],
    queryFn: () => api.get('/waste-logs?limit=10').then((r) => r.data),
  })

  const cardStyle = {
    background: 'linear-gradient(135deg, rgba(26,22,48,0.9), rgba(19,16,42,0.95))',
    border: '1px solid rgba(139,92,246,0.15)',
  }

  useEffect(() => {
    if (!activeEditingLog) {
      reset(defaultValues)
      return
    }

    reset({
      meal: activeEditingLog.meal || 'Breakfast',
      menuItemId: activeEditingLog.menuItemId?._id || activeEditingLog.menuItemId || '',
      wastedKg: activeEditingLog.wastedKg ?? '',
      preparedKg: activeEditingLog.preparedKg ?? '',
      notes: activeEditingLog.notes || '',
    })
  }, [activeEditingLog, reset])

  const clearEditing = () => {
    if (embedded) {
      onEditCleared?.()
    } else {
      setLocalEditingLog(null)
    }
    reset(defaultValues)
  }

  const saveMutation = useMutation({
    mutationFn: (formData) => {
      const payload = {
        meal: formData.meal,
        menuItemId: formData.menuItemId,
        menuItemName: (menuItems?.items || []).find((m) => m._id === formData.menuItemId)?.name || '',
        wastedKg: Number(formData.wastedKg),
        preparedKg: Number(formData.preparedKg),
      }

      if (activeEditingLog?._id) {
        return api.patch(`/waste-logs/${activeEditingLog._id}`, payload)
      }
      return api.post('/waste-logs', payload)
    },
    onSuccess: () => {
      toast.success(activeEditingLog?._id ? 'Waste log updated' : 'Waste logged!')
      clearEditing()
      invalidateWasteQueries(qc)
      onLogged?.()
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (logId) => api.delete(`/waste-logs/${logId}`),
    onSuccess: (_, logId) => {
      toast.success('Waste log deleted')
      if (activeEditingLog?._id === logId) clearEditing()
      invalidateWasteQueries(qc)
      onLogged?.()
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Delete failed'),
  })

  const title = useMemo(() => {
    if (embedded && activeEditingLog?._id) return 'Edit Waste Entry'
    if (embedded) return 'Waste Log'
    if (activeEditingLog?._id) return 'Edit Waste Entry'
    return 'New Waste Entry'
  }, [activeEditingLog?._id, embedded])

  const handleDelete = (log) => {
    if (!window.confirm(`Delete waste log for ${log.menuItemId?.name || log.menuItemName}?`)) return
    deleteMutation.mutate(log._id)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={embedded ? 'space-y-0' : 'space-y-6 max-w-4xl'}>
      {!embedded && (
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Log Waste</h1>
          <p className="text-muted text-sm mt-1">Record post-meal food waste for tracking and analytics</p>
        </div>
      )}

      <div className={`grid grid-cols-1 ${embedded ? '' : 'lg:grid-cols-2'} gap-6`}>
        <div className="rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between gap-3 mb-5">
            <h3 className="font-display font-bold text-lg text-primary">{title}</h3>
            {activeEditingLog?._id && (
              <button
                type="button"
                onClick={clearEditing}
                className="text-xs px-3 py-1.5 rounded-lg border border-border/50 text-muted hover:text-primary transition-colors"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit((formData) => saveMutation.mutate(formData))} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Meal Service</label>
              <div className="relative">
                <select {...register('meal', { required: true })} className="input-field w-full rounded-xl px-4 py-3 text-primary text-sm appearance-none">
                  {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <span className="absolute right-3 top-3.5 text-muted pointer-events-none text-xs">▼</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Menu Item</label>
              <div className="relative">
                <select {...register('menuItemId', { required: true })} className="input-field w-full rounded-xl px-4 py-3 text-primary text-sm appearance-none">
                  <option value="">Select item...</option>
                  {(menuItems?.items || []).map((m) => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
                <span className="absolute right-3 top-3.5 text-muted pointer-events-none text-xs">▼</span>
              </div>
              {errors.menuItemId && <p className="text-red text-xs mt-1">Required</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Waste (kg)</label>
                <input
                  {...register('wastedKg', { required: true, min: 0.1 })}
                  type="number"
                  step="0.1"
                  className="input-field w-full rounded-xl px-4 py-3 text-primary text-sm"
                  placeholder="e.g. 5.5"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Prepared (kg)</label>
                <input
                  {...register('preparedKg', { required: true, min: 0.1 })}
                  type="number"
                  step="0.1"
                  className="input-field w-full rounded-xl px-4 py-3 text-primary text-sm"
                  placeholder="e.g. 50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Notes (optional)</label>
              <textarea
                {...register('notes')}
                rows={2}
                className="input-field w-full rounded-xl px-4 py-3 text-primary text-sm resize-none"
                placeholder="Any observations..."
              />
            </div>

            <button type="submit" disabled={saveMutation.isPending} className="btn-accent w-full text-white font-bold py-4 rounded-xl text-sm">
              {saveMutation.isPending ? (activeEditingLog?._id ? 'Saving...' : 'Logging...') : activeEditingLog?._id ? 'Save Changes' : '📋 Log Waste Entry'}
            </button>
          </form>
        </div>

        {!embedded && (
          <div className="rounded-2xl p-6" style={cardStyle}>
            <h3 className="font-display font-bold text-lg text-primary mb-5">Recent Entries</h3>
            <div className="space-y-3">
              {(recent?.logs || []).map((log) => (
                <RecentEntryCard
                  key={log._id}
                  log={log}
                  onEdit={setLocalEditingLog}
                  onDelete={handleDelete}
                  deleting={deleteMutation.isPending && deleteMutation.variables === log._id}
                />
              ))}
              {!recent?.logs?.length && <p className="text-muted text-sm text-center py-8">No recent entries</p>}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
