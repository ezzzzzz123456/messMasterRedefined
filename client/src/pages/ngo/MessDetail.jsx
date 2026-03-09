import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../api/axios'

export default function MessDetail() {
  const { listingId } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { register, handleSubmit } = useForm({ defaultValues: { requestedQtyKg: '' } })

  const { data, isLoading } = useQuery({
    queryKey: ['ngo-listing-detail', listingId],
    queryFn: () => api.get(`/listings/public/${listingId}`).then(r => r.data),
  })

  const requestMutation = useMutation({
    mutationFn: (payload) => api.post('/requests', payload),
    onSuccess: () => {
      toast.success('Request sent')
      qc.invalidateQueries({ queryKey: ['ngo-requests'] })
      navigate('/ngo/dashboard')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Request failed'),
  })

  return (
    <div className="min-h-screen bg-app p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => navigate('/ngo/dashboard')} className="text-xs border border-border/50 rounded-lg px-3 py-1.5 text-muted">← Back</button>
        <div className="rounded-2xl p-6 border border-border/50" style={{ background: 'rgba(19,16,42,0.9)' }}>
          {isLoading && <p className="text-muted text-sm">Loading...</p>}
          {!isLoading && data && (
            <>
              <h1 className="font-display text-3xl font-bold text-primary mb-1">{data.listing?.messId?.name}</h1>
              <p className="text-muted text-sm mb-4">{data.listing?.messId?.location}</p>
              <p className="text-primary font-semibold">{data.listing?.foodItem} ({data.listing?.foodCategory})</p>
              <p className="text-sm text-muted mb-4">Available: {data.listing?.quantityAvailableKg} kg · ₹{data.listing?.ratePerKg}/kg</p>
              <p className="text-sm text-muted mb-6">Reviews: {Number(data.messReview?.avgOverall || 0).toFixed(1)} / 5 ({data.messReview?.count || 0} ratings)</p>

              <form onSubmit={handleSubmit((v) => requestMutation.mutate({ listingId, requestedQtyKg: Number(v.requestedQtyKg) }))} className="flex gap-3 items-end">
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider block mb-2">Desired Quantity (kg)</label>
                  <input {...register('requestedQtyKg', { required: true, min: 0.1 })} type="number" step="0.1" className="input-field rounded-xl px-4 py-3 text-sm w-48" />
                </div>
                <button type="submit" disabled={requestMutation.isPending} className="btn-accent text-white font-semibold px-5 py-3 rounded-xl text-sm">
                  {requestMutation.isPending ? 'Sending...' : 'Send Food Request'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
