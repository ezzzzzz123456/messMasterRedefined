import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../api/axios'

function formatStatus(status) {
  return String(status || '').replaceAll('_', ' ')
}

export default function BioLoopWaste() {
  const qc = useQueryClient()
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      wasteType: 'dumped_food',
      itemName: '',
      quantityAvailableKg: '',
      ratePerKg: '',
      notes: '',
      scheduledAt: '',
    },
  })
  const { register: settingsRegister, handleSubmit: handleSettingsSubmit } = useForm()

  const { data: settings } = useQuery({
    queryKey: ['bioloop-settings'],
    queryFn: () => api.get('/bioloop/settings').then((r) => r.data),
  })
  const { data } = useQuery({
    queryKey: ['bioloop-mine'],
    queryFn: () => api.get('/bioloop/mine').then((r) => r.data),
    refetchInterval: 10000,
  })

  const createMutation = useMutation({
    mutationFn: (payload) => api.post('/bioloop', payload),
    onSuccess: () => {
      toast.success('BioLoop waste listing saved')
      reset()
      qc.invalidateQueries({ queryKey: ['bioloop-mine'] })
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
        <p className="text-muted text-sm mt-1">Track expired or dumped food waste for biogas buyers.</p>
      </div>

      <div className="rounded-2xl p-6 border border-border/50" style={{ background: 'rgba(19,16,42,0.9)' }}>
        <h2 className="text-primary font-semibold mb-4">Daily Logging Time</h2>
        <form className="flex items-end gap-3" onSubmit={handleSettingsSubmit((payload) => settingsMutation.mutate(payload))}>
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Default End-of-Day Time</label>
            <input
              {...settingsRegister('dailyLogTime')}
              type="time"
              defaultValue={settings?.settings?.dailyLogTime || '21:00'}
              className="input-field rounded-xl px-4 py-3 text-sm"
            />
          </div>
          <button type="submit" className="btn-accent text-white font-semibold px-5 py-3 rounded-xl text-sm">
            Save Time
          </button>
        </form>
      </div>

      <div className="rounded-2xl p-6 border border-border/50" style={{ background: 'rgba(19,16,42,0.9)' }}>
        <h2 className="text-primary font-semibold mb-4">Create BioLoop Listing</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit((payload) => createMutation.mutate(payload))}>
          <select {...register('wasteType', { required: true })} className="input-field rounded-xl px-4 py-3 text-sm">
            <option value="dumped_food">Dumped Food Waste</option>
            <option value="expired_food">Expired Food</option>
          </select>
          <input {...register('itemName', { required: true })} className="input-field rounded-xl px-4 py-3 text-sm" placeholder="Item name" />
          <input {...register('quantityAvailableKg', { required: true })} type="number" step="0.1" className="input-field rounded-xl px-4 py-3 text-sm" placeholder="Quantity (kg)" />
          <input {...register('ratePerKg', { required: true })} type="number" step="0.1" className="input-field rounded-xl px-4 py-3 text-sm" placeholder="Rate per kg" />
          <input {...register('scheduledAt')} type="datetime-local" className="input-field rounded-xl px-4 py-3 text-sm" />
          <textarea {...register('notes')} rows={2} className="input-field rounded-xl px-4 py-3 text-sm md:col-span-2" placeholder="Notes (optional)" />
          <button type="submit" disabled={createMutation.isPending} className="btn-accent text-white font-semibold px-6 py-3 rounded-xl text-sm md:col-span-2 w-fit">
            {createMutation.isPending ? 'Saving...' : 'Add BioLoop Listing'}
          </button>
        </form>
      </div>

      <div className="rounded-2xl p-6 border border-border/50" style={{ background: 'rgba(19,16,42,0.9)' }}>
        <h2 className="text-primary font-semibold mb-4">My BioLoop Listings</h2>
        <div className="space-y-3">
          {(data?.listings || []).map((listing) => (
            <div key={listing._id} className="p-4 rounded-xl border border-border/40 flex items-center justify-between gap-4">
              <div>
                <p className="text-primary font-semibold">{listing.itemName}</p>
                <p className="text-sm text-muted">
                  {formatStatus(listing.wasteType)} · {listing.quantityAvailableKg} kg · ₹{listing.ratePerKg}/kg
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
