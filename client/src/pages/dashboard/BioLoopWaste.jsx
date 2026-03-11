import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../api/axios'

function formatStatus(status) {
  return String(status || '').replaceAll('_', ' ')
}

export default function BioLoopWaste() {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      manualDumpedKg: '',
      ratePerKg: '',
      notes: '',
    },
  })
  const { register: settingsRegister, handleSubmit: handleSettingsSubmit } = useForm()

  const { data: settings } = useQuery({
    queryKey: ['bioloop-settings'],
    queryFn: () => api.get('/bioloop/settings').then((r) => r.data),
  })
  const { data: tracker } = useQuery({
    queryKey: ['bioloop-tracker'],
    queryFn: () => api.get('/bioloop/tracker').then((r) => r.data),
    refetchInterval: 10000,
  })
  const { data } = useQuery({
    queryKey: ['bioloop-mine'],
    queryFn: () => api.get('/bioloop/mine').then((r) => r.data),
    refetchInterval: 10000,
  })

  const autoTrackedExpiredKg = Number(tracker?.autoTrackedExpiredKg || 0)
  const manualDumpedKg = Number(watch('manualDumpedKg') || 0)
  const totalQuantityKg = useMemo(
    () => Number((autoTrackedExpiredKg + manualDumpedKg).toFixed(2)),
    [autoTrackedExpiredKg, manualDumpedKg],
  )

  const createMutation = useMutation({
    mutationFn: (payload) => api.post('/bioloop', payload),
    onSuccess: () => {
      toast.success('BioLoop waste listing saved')
      reset()
      qc.invalidateQueries({ queryKey: ['bioloop-mine'] })
      qc.invalidateQueries({ queryKey: ['bioloop-tracker'] })
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to save listing'),
  })

  const settingsMutation = useMutation({
    mutationFn: (payload) => api.patch('/bioloop/settings', payload),
    onSuccess: () => {
      toast.success('BioLoop logging time updated')
      qc.invalidateQueries({ queryKey: ['bioloop-settings'] })
      qc.invalidateQueries({ queryKey: ['mess'] })
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update logging time'),
  })

  const toggleMutation = useMutation({
    mutationFn: (id) => api.patch(`/bioloop/${id}/toggle`),
    onSuccess: () => {
      toast.success('Listing updated')
      qc.invalidateQueries({ queryKey: ['bioloop-mine'] })
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update listing'),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-primary">BioLoop Waste</h1>
        <p className="text-muted text-sm mt-1">Combine automatically tracked expired food with manual dumped waste for biogas buyers.</p>
      </div>

      <div className="rounded-2xl p-6 border border-border/50" style={{ background: 'rgba(19,16,42,0.9)' }}>
        <h2 className="text-primary font-semibold mb-4">Daily Logging Time</h2>
        <form className="flex flex-col md:flex-row md:items-end gap-3" onSubmit={handleSettingsSubmit((payload) => settingsMutation.mutate(payload))}>
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Default End-of-Day Time</label>
            <input
              {...settingsRegister('dailyLogTime')}
              type="time"
              defaultValue={settings?.settings?.dailyLogTime || '21:00'}
              className="input-field rounded-xl px-4 py-3 text-sm"
            />
          </div>
          <div className="text-xs text-muted md:pb-1">
            NGO listings now auto-expire after <span className="text-accent-bright font-semibold">30 seconds</span> for testing.
          </div>
          <button type="submit" className="btn-accent text-white font-semibold px-5 py-3 rounded-xl text-sm">
            Save Time
          </button>
        </form>
      </div>

      <div className="rounded-2xl p-6 border border-border/50" style={{ background: 'rgba(19,16,42,0.9)' }}>
        <h2 className="text-primary font-semibold mb-4">Create BioLoop Listing</h2>
        <form className="space-y-5" onSubmit={handleSubmit((payload) => createMutation.mutate(payload))}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border/40 p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Automatically Tracked Expired Waste</p>
              <p className="text-3xl font-display font-bold text-primary">{autoTrackedExpiredKg.toFixed(1)} kg</p>
              <p className="text-xs text-muted mt-2">Derived from NGO food listings that expire after the 30-second simulation window.</p>
            </div>

            <div className="rounded-2xl border border-border/40 p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Manually Entered Dumped Waste (kg)</label>
              <input
                {...register('manualDumpedKg', { min: { value: 0, message: 'Cannot be negative' } })}
                type="number"
                min="0"
                step="0.1"
                className="input-field rounded-xl px-4 py-3 text-sm w-full"
                placeholder="0.0"
              />
              {errors.manualDumpedKg && <p className="text-red text-xs mt-1">{errors.manualDumpedKg.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr] gap-4">
            <div className="rounded-2xl border border-accent/20 p-5" style={{ background: 'rgba(139,92,246,0.06)' }}>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Total Biodegradable Waste</p>
              <p className="text-3xl font-display font-bold text-accent-bright">{totalQuantityKg.toFixed(1)} kg</p>
              <p className="text-xs text-muted mt-2">Automatically combined from expired food and dumped waste.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Rate per kg</label>
                <input
                  {...register('ratePerKg', {
                    required: 'Rate is required',
                    min: { value: 0.01, message: 'Rate per kg must be greater than zero' },
                  })}
                  type="number"
                  min="0.01"
                  step="any"
                  inputMode="decimal"
                  className="input-field rounded-xl px-4 py-3 text-sm w-full"
                  placeholder="Rate per kg (e.g. 10 or 10.5)"
                />
                {errors.ratePerKg && <p className="text-red text-xs mt-1">{errors.ratePerKg.message}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Notes (optional)</label>
                <textarea {...register('notes')} rows={3} className="input-field rounded-xl px-4 py-3 text-sm w-full resize-none" placeholder="Pickup or handling notes..." />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted">Listings are scheduled using the saved daily logging time above. Manual date-time entry is removed to avoid formatting issues.</p>
            <button type="submit" disabled={createMutation.isPending || totalQuantityKg <= 0} className="btn-accent text-white font-semibold px-6 py-3 rounded-xl text-sm">
              {createMutation.isPending ? 'Saving...' : 'Add BioLoop Listing'}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl p-6 border border-border/50" style={{ background: 'rgba(19,16,42,0.9)' }}>
        <h2 className="text-primary font-semibold mb-4">My BioLoop Listings</h2>
        <div className="space-y-3">
          {(data?.listings || []).map((listing) => (
            <div key={listing._id} className="p-4 rounded-xl border border-border/40 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-primary font-semibold">{listing.itemName}</p>
                <p className="text-sm text-muted">
                  Auto expired: {Number(listing.autoTrackedExpiredKg || 0).toFixed(1)} kg · Manual dumped: {Number(listing.manualDumpedKg || 0).toFixed(1)} kg
                </p>
                <p className="text-sm text-muted">
                  Total: {listing.quantityAvailableKg} kg · ₹{listing.ratePerKg}/kg
                </p>
                <p className="text-xs text-muted mt-1">
                  Status: {formatStatus(listing.status)} · Scheduled: {new Date(listing.scheduledAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => toggleMutation.mutate(listing._id)}
                className="text-xs px-3 py-1.5 rounded-lg border border-border/50 text-muted hover:text-primary"
              >
                {listing.isMarketplaceVisible ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))}
          {!data?.listings?.length && <p className="text-muted text-sm">No BioLoop listings yet.</p>}
        </div>
      </div>
    </div>
  )
}
