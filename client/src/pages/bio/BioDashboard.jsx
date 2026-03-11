import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/axios'
import useAuthStore from '../../store/useAuthStore'
import NearbyMessesMap from '../../components/maps/NearbyMessesMap'

export default function BioDashboard() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['bio-nearby-listings'],
    queryFn: () => api.get('/bioloop/public/nearby').then((r) => r.data),
    refetchInterval: 5000,
  })
  const { data: requests } = useQuery({
    queryKey: ['bio-requests'],
    queryFn: () => api.get('/bioloop-requests/bio').then((r) => r.data),
    refetchInterval: 5000,
  })

  return (
    <div className="min-h-screen bg-app p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-primary">BioLoop Dashboard</h1>
            <p className="text-muted text-sm mt-1">Browse nearby dumped food waste and track purchase requests.</p>
          </div>
          <button onClick={async () => { await logout(); navigate('/') }} className="text-xs border border-border/50 rounded-lg px-3 py-1.5 text-muted">Sign Out</button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr,0.8fr] gap-6">
          <div className="rounded-2xl p-6 border border-border/50" style={{ background: 'rgba(19,16,42,0.9)' }}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-primary font-semibold">Nearby Waste Map</h2>
                <p className="text-muted text-sm mt-1">
                  Dumped and expired food waste listings within 50 km of {data?.center?.location || 'your plant'}.
                </p>
              </div>
              <div className="text-right text-xs text-muted">
                <p>Radius</p>
                <p className="text-primary font-semibold">{data?.radiusKm || 50} km</p>
              </div>
            </div>

            {isError && (
              <div className="rounded-xl border border-red/30 bg-red/10 px-4 py-3 text-sm text-red">
                {error?.response?.data?.error || 'Unable to load nearby BioLoop map.'}
              </div>
            )}

            {!isError && (
              <NearbyMessesMap
                center={data?.center}
                messes={data?.messes || []}
                centerTitle="Your BioLoop Plant"
                centerLabel="B"
                centerColor="#7c3aed"
                listingLabel="W"
                listingColor="#a78bfa"
                emptyMessage="BioLoop location is unavailable."
              />
            )}
          </div>

          <div className="rounded-2xl p-6 border border-border/50" style={{ background: 'rgba(19,16,42,0.9)' }}>
            <h2 className="text-primary font-semibold mb-4">Nearby Coverage</h2>
            <div className="space-y-3">
              {(data?.messes || []).map((mess) => (
                <div key={mess._id} className="p-4 rounded-xl border border-border/40">
                  <p className="text-primary font-semibold">{mess.name}</p>
                  <p className="text-sm text-muted">{mess.location}</p>
                  <p className="text-xs text-accent-bright mt-2">
                    {mess.distanceKm} km away · {mess.activeListingCount} active listing{mess.activeListingCount === 1 ? '' : 's'}
                  </p>
                </div>
              ))}
              {!data?.messes?.length && !isLoading && !isError && (
                <p className="text-muted text-sm">No active BioLoop listings found within 50 km.</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 border border-border/50" style={{ background: 'rgba(19,16,42,0.9)' }}>
          <h2 className="text-primary font-semibold mb-4">Available Waste Listings</h2>
          {isLoading && <p className="text-muted text-sm">Loading listings...</p>}
          <div className="space-y-3">
            {(data?.listings || []).map((listing) => (
              <div key={listing._id} className="p-4 rounded-xl border border-border/40 flex items-center justify-between">
                <div>
                  <p className="text-primary font-semibold">{listing.messId?.name} · {String(listing.wasteType || '').replaceAll('_', ' ')}</p>
                  <p className="text-sm text-muted">{listing.messId?.location} · {listing.quantityAvailableKg} kg · ₹{listing.ratePerKg}/kg</p>
                </div>
                <Link to={`/bio/listing/${listing._id}`} className="text-xs px-3 py-1.5 rounded-lg bg-accent text-white">View</Link>
              </div>
            ))}
            {!data?.listings?.length && !isLoading && !isError && <p className="text-muted text-sm">No BioLoop listings.</p>}
          </div>
        </div>

        <div className="rounded-2xl p-6 border border-border/50" style={{ background: 'rgba(19,16,42,0.9)' }}>
          <h2 className="text-primary font-semibold mb-4">My Requests</h2>
          <div className="space-y-3">
            {(requests?.requests || []).map((request) => (
              <div key={request._id} className="p-4 rounded-xl border border-border/40">
                <p className="text-primary font-semibold">{request.listingId?.itemName || 'Waste Listing'}</p>
                <p className="text-sm text-muted">Qty: {request.requestedQtyKg} kg · Offer: ₹{request.offeredRatePerKg}/kg</p>
                <p className="text-xs mt-1 uppercase text-accent-bright">Status: {request.status}</p>
              </div>
            ))}
            {!requests?.requests?.length && <p className="text-muted text-sm">No BioLoop requests yet.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
