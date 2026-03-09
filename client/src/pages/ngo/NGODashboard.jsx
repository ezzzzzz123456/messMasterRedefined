import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/axios'
import useAuthStore from '../../store/useAuthStore'

export default function NGODashboard() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const { data, isLoading } = useQuery({
    queryKey: ['ngo-public-listings'],
    queryFn: () => api.get('/listings/public/all').then(r => r.data),
    refetchInterval: 5000,
  })
  const { data: requests } = useQuery({
    queryKey: ['ngo-requests'],
    queryFn: () => api.get('/requests/ngo').then(r => r.data),
    refetchInterval: 5000,
  })

  return (
    <div className="min-h-screen bg-app p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-primary">NGO Dashboard</h1>
            <p className="text-muted text-sm mt-1">Browse available food and track request status</p>
          </div>
          <button onClick={async () => { await logout(); navigate('/') }} className="text-xs border border-border/50 rounded-lg px-3 py-1.5 text-muted">Sign Out</button>
        </div>

        <div className="rounded-2xl p-6 border border-border/50" style={{ background: 'rgba(19,16,42,0.9)' }}>
          <h2 className="text-primary font-semibold mb-4">Available Mess Listings</h2>
          {isLoading && <p className="text-muted text-sm">Loading listings...</p>}
          <div className="space-y-3">
            {(data?.listings || []).map(l => (
              <div key={l._id} className="p-4 rounded-xl border border-border/40 flex items-center justify-between">
                <div>
                  <p className="text-primary font-semibold">{l.messId?.name} · {l.foodItem}</p>
                  <p className="text-sm text-muted">{l.messId?.location} · {l.quantityAvailableKg} kg · ₹{l.ratePerKg}/kg</p>
                </div>
                <Link to={`/ngo/mess/${l._id}`} className="text-xs px-3 py-1.5 rounded-lg bg-accent text-white">View</Link>
              </div>
            ))}
            {!data?.listings?.length && !isLoading && <p className="text-muted text-sm">No active listings.</p>}
          </div>
        </div>

        <div className="rounded-2xl p-6 border border-border/50" style={{ background: 'rgba(19,16,42,0.9)' }}>
          <h2 className="text-primary font-semibold mb-4">My Requests</h2>
          <div className="space-y-3">
            {(requests?.requests || []).map(r => (
              <div key={r._id} className="p-4 rounded-xl border border-border/40">
                <p className="text-primary font-semibold">{r.listingId?.foodItem || 'Food Item'}</p>
                <p className="text-sm text-muted">Qty: {r.requestedQtyKg} kg · ₹{r.ratePerKg}/kg</p>
                <p className="text-xs mt-1 uppercase text-accent-bright">Status: {r.status}</p>
              </div>
            ))}
            {!requests?.requests?.length && <p className="text-muted text-sm">No requests yet.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
