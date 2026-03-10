import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../api/axios'

export default function FoodListings() {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: { foodCategory: '', foodItem: '', quantityAvailableKg: '', ratePerKg: '', notes: '' },
  })
  const selectedFoodItem = watch('foodItem')

  const { data: menuData } = useQuery({
    queryKey: ['menu-items-approved-for-listing'],
    queryFn: () => api.get('/menu-items').then(r => r.data),
  })

  const { data } = useQuery({
    queryKey: ['food-listings-mine'],
    queryFn: () => api.get('/listings/mine').then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (payload) => api.post('/listings', payload),
    onSuccess: () => {
      toast.success('Listing created')
      reset()
      qc.invalidateQueries({ queryKey: ['food-listings-mine'] })
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create listing'),
  })

  const toggleMutation = useMutation({
    mutationFn: (id) => api.patch(`/listings/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['food-listings-mine'] }),
  })

  useEffect(() => {
    const selected = (menuData?.items || []).find(i => i.name === selectedFoodItem)
    setValue('foodCategory', selected?.category || '')
  }, [selectedFoodItem, menuData?.items, setValue])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-primary">Food Listings</h1>
        <p className="text-muted text-sm mt-1">List excess food for NGO requests</p>
      </div>

      <div className="rounded-2xl p-6 border border-border/50" style={{ background: 'rgba(19,16,42,0.9)' }}>
        <h2 className="text-primary font-semibold mb-4">Create Listing</h2>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={handleSubmit((payload) => {
            const selected = (menuData?.items || []).find(i => i.name === payload.foodItem)
            createMutation.mutate({
              ...payload,
              foodCategory: selected?.category || payload.foodCategory,
            })
          })}
        >
          <select {...register('foodItem', { required: true })} className="input-field rounded-xl px-4 py-3 text-sm">
            <option value="">Select approved food item...</option>
            {(menuData?.items || []).map(item => (
              <option key={item._id} value={item.name}>
                {item.name} ({item.category})
              </option>
            ))}
          </select>
          <input {...register('foodCategory')} readOnly className="input-field rounded-xl px-4 py-3 text-sm opacity-70" placeholder="Auto-filled from approved item" />
          <input {...register('quantityAvailableKg', { required: true })} type="number" step="0.1" className="input-field rounded-xl px-4 py-3 text-sm" placeholder="Quantity (kg)" />
          <input {...register('ratePerKg', { required: true })} type="number" step="0.1" className="input-field rounded-xl px-4 py-3 text-sm" placeholder="Rate per kg" />
          <textarea {...register('notes')} className="input-field rounded-xl px-4 py-3 text-sm md:col-span-2" rows={2} placeholder="Notes (optional)" />
          <button type="submit" disabled={createMutation.isPending} className="btn-accent text-white font-semibold px-6 py-3 rounded-xl text-sm md:col-span-2 w-fit">
            {createMutation.isPending ? 'Creating...' : 'Add Listing'}
          </button>
        </form>
      </div>

      <div className="rounded-2xl p-6 border border-border/50" style={{ background: 'rgba(19,16,42,0.9)' }}>
        <h2 className="text-primary font-semibold mb-4">My Listings</h2>
        <div className="space-y-3">
          {(data?.listings || []).map(listing => (
            <div key={listing._id} className="p-4 rounded-xl border border-border/40 flex items-center justify-between">
              <div>
                <p className="text-primary font-semibold">{listing.foodItem}</p>
                <p className="text-sm text-muted">{listing.foodCategory} · {listing.quantityAvailableKg} kg · ₹{listing.ratePerKg}/kg</p>
              </div>
              <button onClick={() => toggleMutation.mutate(listing._id)} className="text-xs px-3 py-1.5 rounded-lg border border-border/50 text-muted hover:text-primary">
                {listing.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))}
          {!data?.listings?.length && <p className="text-muted text-sm">No listings yet.</p>}
        </div>
      </div>
    </div>
  )
}
