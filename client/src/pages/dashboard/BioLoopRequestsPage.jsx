import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../api/axios'

export default function BioLoopRequestsPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['bioloop-mess-requests-pending'],
    queryFn: () => api.get('/bioloop-requests/mess?status=pending').then((r) => r.data),
    refetchInterval: 5000,
  })

  const decisionMutation = useMutation({
    mutationFn: ({ id, decision }) => api.patch(`/bioloop-requests/${id}/decision`, { decision }),
    onSuccess: () => {
      toast.success('BioLoop request updated')
      qc.invalidateQueries({ queryKey: ['bioloop-mess-requests-pending'] })
      qc.invalidateQueries({ queryKey: ['bioloop-mess-orders'] })
      qc.invalidateQueries({ queryKey: ['bioloop-mess-notification-count'] })
      qc.invalidateQueries({ queryKey: ['bioloop-mine'] })
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  })

  const clearMutation = useMutation({
    mutationFn: () => api.patch('/bioloop-requests/mess/notifications/clear'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bioloop-mess-notification-count'] }),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">BioLoop Requests</h1>
          <p className="text-muted text-sm mt-1">Accept or decline incoming biogas waste purchase requests.</p>
        </div>
        <button onClick={() => clearMutation.mutate()} className="text-xs border border-border/50 rounded-lg px-3 py-1.5 text-muted">
          Clear Notifications
        </button>
      </div>

      <div className="rounded-2xl p-6 border border-border/50" style={{ background: 'rgba(19,16,42,0.9)' }}>
        {isLoading && <p className="text-muted text-sm">Loading...</p>}
        <div className="space-y-3">
          {(data?.requests || []).map((req) => (
            <div key={req._id} className="p-4 rounded-xl border border-border/40 flex items-center justify-between gap-4">
              <div>
                <p className="text-primary font-semibold">{req.listingId?.itemName || 'Waste Listing'}</p>
                <p className="text-sm text-muted">
                  Bio Admin: {req.bioId?.organizationName || req.bioId?.name} · Qty: {req.requestedQtyKg} kg · Offer: ₹{req.offeredRatePerKg}/kg
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => decisionMutation.mutate({ id: req._id, decision: 'accepted' })} className="text-xs px-3 py-1.5 rounded-lg bg-green text-white">
                  Accept
                </button>
                <button onClick={() => decisionMutation.mutate({ id: req._id, decision: 'declined' })} className="text-xs px-3 py-1.5 rounded-lg bg-red text-white">
                  Decline
                </button>
              </div>
            </div>
          ))}
          {!data?.requests?.length && !isLoading && <p className="text-muted text-sm">No pending BioLoop requests.</p>}
        </div>
      </div>
    </div>
  )
}
