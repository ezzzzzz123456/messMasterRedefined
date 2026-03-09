import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../api/axios'

export default function RequestsPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['mess-requests-pending'],
    queryFn: () => api.get('/requests/mess?status=pending').then(r => r.data),
    refetchInterval: 5000,
  })

  const decisionMutation = useMutation({
    mutationFn: ({ id, decision }) => api.patch(`/requests/${id}/decision`, { decision }),
    onSuccess: () => {
      toast.success('Request updated')
      qc.invalidateQueries({ queryKey: ['mess-requests-pending'] })
      qc.invalidateQueries({ queryKey: ['mess-orders'] })
      qc.invalidateQueries({ queryKey: ['mess-notification-count'] })
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  })

  const clearMutation = useMutation({
    mutationFn: () => api.patch('/requests/mess/notifications/clear'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mess-notification-count'] }),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">NGO Requests</h1>
          <p className="text-muted text-sm mt-1">Accept or decline incoming food requests</p>
        </div>
        <button onClick={() => clearMutation.mutate()} className="text-xs border border-border/50 rounded-lg px-3 py-1.5 text-muted">
          Clear Notifications
        </button>
      </div>

      <div className="rounded-2xl p-6 border border-border/50" style={{ background: 'rgba(19,16,42,0.9)' }}>
        {isLoading && <p className="text-muted text-sm">Loading...</p>}
        <div className="space-y-3">
          {(data?.requests || []).map(req => (
            <div key={req._id} className="p-4 rounded-xl border border-border/40 flex items-center justify-between gap-4">
              <div>
                <p className="text-primary font-semibold">{req.listingId?.foodItem || 'Food Item'}</p>
                <p className="text-sm text-muted">
                  NGO: {req.ngoId?.organizationName || req.ngoId?.name} · Qty: {req.requestedQtyKg} kg · ₹{req.ratePerKg}/kg
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => decisionMutation.mutate({ id: req._id, decision: 'accepted' })} className="text-xs px-3 py-1.5 rounded-lg bg-green text-white">Accept</button>
                <button onClick={() => decisionMutation.mutate({ id: req._id, decision: 'declined' })} className="text-xs px-3 py-1.5 rounded-lg bg-red text-white">Decline</button>
              </div>
            </div>
          ))}
          {!data?.requests?.length && !isLoading && <p className="text-muted text-sm">No pending requests.</p>}
        </div>
      </div>
    </div>
  )
}
