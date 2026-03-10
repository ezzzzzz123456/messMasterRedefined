import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import NearbyMessesMap from '../components/maps/NearbyMessesMap'
import BioLoopLogo from '../components/ui/BioLoopLogo'

export default function BioLoop() {
  const { data, isLoading } = useQuery({
    queryKey: ['bioloop-public-preview'],
    queryFn: () => api.get('/bioloop/public/preview').then((r) => r.data),
    refetchInterval: 10000,
  })

  const messes = (data?.listings || []).reduce((acc, listing) => {
    const mess = listing.messId
    if (!mess || acc.find((entry) => entry._id === mess._id)) return acc
    acc.push({
      ...mess,
      activeListingCount: (data?.listings || []).filter((entry) => entry.messId?._id === mess._id).length,
    })
    return acc
  }, [])

  return (
    <div className="min-h-screen bg-app p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 border border-accent/30 text-xs text-accent-bright mb-4" style={{ background: 'rgba(139,92,246,0.08)' }}>
              <BioLoopLogo className="h-4 w-4" />
              BioLoop Marketplace
            </div>
            <h1 className="font-display text-4xl font-bold text-primary">BioLoop Waste Exchange</h1>
            <p className="text-muted text-sm mt-2 max-w-2xl">
              Discover dumped and expired food waste listings from mess kitchens for biogas generation and circular reuse.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login/bio" className="btn-accent text-white font-semibold px-5 py-3 rounded-xl text-sm">Login / Register</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.15fr,0.85fr] gap-6">
          <div className="rounded-2xl p-6 border border-border/50" style={{ background: 'rgba(19,16,42,0.9)' }}>
            <h2 className="text-primary font-semibold mb-4">Marketplace Map</h2>
            <NearbyMessesMap
              messes={messes}
              center={null}
              centerTitle="BioLoop"
              centerLabel="B"
              listingLabel="W"
              listingColor="#a78bfa"
              emptyMessage="No active BioLoop listings available."
            />
          </div>

          <div className="rounded-2xl p-6 border border-border/50" style={{ background: 'rgba(19,16,42,0.9)' }}>
            <h2 className="text-primary font-semibold mb-4">Active Waste Listings</h2>
            {isLoading && <p className="text-muted text-sm">Loading listings...</p>}
            <div className="space-y-3">
              {(data?.listings || []).map((listing) => (
                <div key={listing._id} className="p-4 rounded-xl border border-border/40">
                  <p className="text-primary font-semibold">{listing.itemName}</p>
                  <p className="text-sm text-muted">{listing.messId?.name} · {listing.quantityAvailableKg} kg · ₹{listing.ratePerKg}/kg</p>
                  <p className="text-xs text-accent-bright mt-2 uppercase">{String(listing.wasteType || '').replaceAll('_', ' ')}</p>
                </div>
              ))}
              {!data?.listings?.length && !isLoading && <p className="text-muted text-sm">No BioLoop listings yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
