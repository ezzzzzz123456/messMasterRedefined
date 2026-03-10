import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../api/axios'

const TABS = ['Accepted Orders', 'Completed Orders', 'Order History']

export default function BioLoopOrdersPage() {
  const [tab, setTab] = useState(0)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['bioloop-mess-orders'],
    queryFn: () => api.get('/bioloop-requests/mess').then((r) => r.data),
    refetchInterval: 5000,
  })

  const completeMutation = useMutation({
    mutationFn: (id) => api.patch(`/bioloop-requests/${id}/complete`),
    onSuccess: () => {
      toast.success('BioLoop order marked completed')
      qc.invalidateQueries({ queryKey: ['bioloop-mess-orders'] })
      qc.invalidateQueries({ queryKey: ['bioloop-mine'] })
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  })

  const requests = data?.requests || []
  const accepted = useMemo(() => requests.filter((r) => r.status === 'accepted'), [requests])
  const completed = useMemo(() => requests.filter((r) => r.status === 'completed'), [requests])
  const history = useMemo(() => requests, [requests])
  const current = tab === 0 ? accepted : tab === 1 ? completed : history

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-primary">BioLoop Orders</h1>
        <p className="text-muted text-sm mt-1">Track accepted and completed BioLoop waste pickups.</p>
      </div>

      <div className="flex gap-2 p-1 rounded-2xl border border-border/50 w-fit">
        {TABS.map((tabLabel, index) => (
          <button key={tabLabel} onClick={() => setTab(index)} className={`px-4 py-2 rounded-xl text-sm ${tab === index ? 'bg-accent text-white' : 'text-muted'}`}>
            {tabLabel}
          </button>
        ))}
      </div>

      <div className="rounded-2xl p-6 border border-border/50" style={{ background: 'rgba(19,16,42,0.9)' }}>
        {isLoading && <p className="text-muted text-sm">Loading...</p>}
        <div className="space-y-3">
          {current.map((order) => (
            <div key={order._id} className="p-4 rounded-xl border border-border/40 flex items-center justify-between gap-4">
              <div>
                <p className="text-primary font-semibold">{order.listingId?.itemName || 'Waste Listing'}</p>
                <p className="text-sm text-muted">
                  Qty: {order.requestedQtyKg} kg · Offer: ₹{order.offeredRatePerKg}/kg · Gross: ₹{order.grossAmount} · Platform Fee: ₹{order.platformFeeAmount} · Mess Payout: ₹{order.messPayoutAmount}
                </p>
                <p className="text-xs text-muted uppercase mt-1">Status: {order.status}</p>
              </div>
              {tab === 0 && (
                <button onClick={() => completeMutation.mutate(order._id)} className="text-xs px-3 py-1.5 rounded-lg bg-accent text-white">
                  Mark Completed
                </button>
              )}
            </div>
          ))}
          {!current.length && !isLoading && <p className="text-muted text-sm">No BioLoop records in this section.</p>}
        </div>
      </div>
    </div>
  )
}
