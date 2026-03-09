import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import KPICard from '../../components/ui/KPICard'

const CATEGORY_OPTIONS = ['Grains', 'Legumes', 'Vegetables', 'Dairy', 'Spices', 'Oils', 'Utensils', 'Energy', 'Other']
const UNIT_OPTIONS = ['kg', 'L', 'units']

export default function InventoryPage() {
  const qc = useQueryClient()
  const [category, setCategory] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', category: 'Other', unit: 'kg', quantity: 0, minQuantity: 0 })
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { name: '', category: 'Other', unit: 'kg', quantity: 0, minQuantity: 0 },
  })
  const cardStyle = { background: 'linear-gradient(135deg, rgba(26,22,48,0.9), rgba(19,16,42,0.95))', border: '1px solid rgba(139,92,246,0.15)' }

  const { data } = useQuery({ queryKey: ['inventory'], queryFn: () => api.get('/inventory').then(r => r.data), refetchInterval: 10000 })
  const { data: lowStock } = useQuery({ queryKey: ['low-stock'], queryFn: () => api.get('/inventory/low-stock').then(r => r.data), refetchInterval: 10000 })
  const { data: energy } = useQuery({ queryKey: ['energy'], queryFn: () => api.get('/inventory/energy-summary').then(r => r.data) })
  const { data: reorder } = useQuery({
    queryKey: ['reorder-suggestions'],
    queryFn: () => api.get('/inventory/reorder-suggestions').then(r => r.data),
    refetchInterval: 10000,
  })

  const updateMut = useMutation({
    mutationFn: ({ id, qty }) => api.patch(`/inventory/${id}`, { qty }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  })

  const addMut = useMutation({
    mutationFn: (payload) => api.post('/inventory', payload),
    onSuccess: () => {
      toast.success('Inventory item added')
      setShowAdd(false)
      reset()
      qc.invalidateQueries({ queryKey: ['inventory'] })
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to add item'),
  })

  const saveEditMut = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/inventory/${id}`, payload),
    onSuccess: () => {
      toast.success('Inventory item updated')
      setEditingId(null)
      qc.invalidateQueries({ queryKey: ['inventory'] })
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update item'),
  })

  const removeMut = useMutation({
    mutationFn: (id) => api.delete(`/inventory/${id}`),
    onSuccess: () => {
      toast.success('Item removed')
      qc.invalidateQueries({ queryKey: ['inventory'] })
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to remove item'),
  })

  const reorderMut = useMutation({
    mutationFn: () => api.post('/inventory/authorize-reorder'),
    onSuccess: () => {
      toast.success('Authorized reorder applied')
      qc.invalidateQueries({ queryKey: ['inventory'] })
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Reorder failed'),
  })

  const categories = ['All', ...new Set((data?.items || []).map(i => i.category))]
  const filtered = category === 'All' ? (data?.items || []) : (data?.items || []).filter(i => i.category === category)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-primary">Inventory Management</h1>
        <p className="text-muted text-sm mt-1">Mess Main Depot · Real-time stock tracking</p>
      </div>

      {/* AI Banner */}
      <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'rgba(19,16,42,0.9)', border: '1px solid rgba(139,92,246,0.2)', borderLeft: '3px solid #8b5cf6' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)' }}>
              <span className="text-xl">🧠</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-accent-bright uppercase tracking-wider">AI Logistics Intelligence</span>
                <span className="text-xs px-2 py-0.5 rounded-full text-muted" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>AI-DRIVEN</span>
              </div>
              <p className="text-sm text-muted">
                {reorder?.count
                  ? `${reorder.count} low-stock items need reorder authorization.`
                  : 'No critical reorder needed right now.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => reorderMut.mutate()}
            disabled={reorderMut.isPending || !reorder?.count}
            className="btn-accent text-white font-bold text-xs px-5 py-2.5 rounded-xl shrink-0 flex items-center gap-2 disabled:opacity-50"
          >
            ⚡ {reorderMut.isPending ? 'Authorizing...' : 'Authorize Reorder'}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total SKUs" value={data?.total || 0} icon="📦" color="accent" />
        <KPICard label="Critical Items" value={lowStock?.items?.length || 0} icon="⚠️" color="red" />
        <KPICard label="Gas This Month" value={energy?.mtd?.gasKg || 0} unit="kg" icon="🔥" color="yellow" />
        <KPICard label="Electricity" value={energy?.mtd?.electricityKwh || 0} unit="kWh" icon="⚡" color="blue" />
      </div>

      {/* Low Stock Alerts */}
      {lowStock?.items?.length > 0 && (
        <div className="rounded-2xl p-5" style={cardStyle}>
          <h3 className="font-display font-bold text-lg text-primary mb-4 flex items-center gap-2">
            🚨 Low Stock Alerts
            <span className="text-xs font-normal px-2 py-0.5 rounded-full text-red" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{lowStock.items.length} items</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStock.items.map(item => (
              <div key={item._id} className="p-3 rounded-xl flex items-center justify-between" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderLeft: '2px solid #ef4444' }}>
                <div>
                  <p className="text-sm font-semibold text-primary">{item.name}</p>
                  <p className="text-xs text-muted">{item.qty} {item.unit} remaining</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-lg font-bold text-red" style={{ background: 'rgba(239,68,68,0.1)' }}>LOW</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category filter + Table */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <div className="flex flex-col md:flex-row justify-between gap-4 p-5 border-b border-border/30">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field rounded-xl px-3 py-2 text-xs w-full md:w-64"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={() => setShowAdd(s => !s)} className="btn-accent text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 w-fit">
            + New Stock Entry
          </button>
        </div>

        {showAdd && (
          <form onSubmit={handleSubmit((v) => addMut.mutate({ ...v, quantity: Number(v.quantity), minQuantity: Number(v.minQuantity) }))} className="p-5 grid grid-cols-1 md:grid-cols-6 gap-3 border-b border-border/30">
            <input {...register('name', { required: true })} className="input-field rounded-xl px-3 py-2 text-sm md:col-span-2" placeholder="Item name" />
            <select {...register('category', { required: true })} className="input-field rounded-xl px-3 py-2 text-sm">
              {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <select {...register('unit', { required: true })} className="input-field rounded-xl px-3 py-2 text-sm">
              {UNIT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <input {...register('quantity', { required: true })} type="number" className="input-field rounded-xl px-3 py-2 text-sm" placeholder="Qty" />
            <input {...register('minQuantity', { required: true })} type="number" className="input-field rounded-xl px-3 py-2 text-sm" placeholder="Min Qty" />
            <div className="md:col-span-6 flex justify-end gap-2">
              <button type="button" onClick={() => setShowAdd(false)} className="text-xs px-3 py-2 rounded-lg border border-border/50 text-muted">Cancel</button>
              <button type="submit" disabled={addMut.isPending} className="btn-accent text-white text-xs px-3 py-2 rounded-lg">{addMut.isPending ? 'Adding...' : 'Add Item'}</button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr style={{ background: 'rgba(13,11,26,0.5)', borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
                {['Item', 'Category', 'Stock Level', 'Status', 'Last Updated'].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-bold text-muted uppercase tracking-wider">{h}</th>
                ))}
                <th className="px-5 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {filtered.map(item => {
                const pct = Math.min(100, (item.qty / (item.minQty * 5)) * 100)
                const isLow = item.qty <= item.minQty
                const isEditing = editingId === item._id
                return (
                  <tr key={item._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5">
                      {isEditing ? (
                        <input className="input-field rounded-lg px-2 py-1 text-xs w-full" value={editForm.name} onChange={(e) => setEditForm(s => ({ ...s, name: e.target.value }))} />
                      ) : (
                        <p className="font-semibold text-primary">{item.name}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-muted text-xs">
                      {isEditing ? (
                        <select className="input-field rounded-lg px-2 py-1 text-xs" value={editForm.category} onChange={(e) => setEditForm(s => ({ ...s, category: e.target.value }))}>
                          {CATEGORY_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                        </select>
                      ) : item.category}
                    </td>
                    <td className="px-5 py-3.5">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <input type="number" className="input-field rounded-lg px-2 py-1 text-xs w-20" value={editForm.quantity} onChange={(e) => setEditForm(s => ({ ...s, quantity: Number(e.target.value || 0) }))} />
                          <select className="input-field rounded-lg px-2 py-1 text-xs" value={editForm.unit} onChange={(e) => setEditForm(s => ({ ...s, unit: e.target.value }))}>
                            {UNIT_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                          </select>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-1.5 rounded-full" style={{ background: '#2d2550' }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: isLow ? '#ef4444' : '#8b5cf6' }} />
                          </div>
                          <span className={`font-mono text-sm font-medium ${isLow ? 'text-red' : 'text-primary'}`}>{item.qty} {item.unit}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {isEditing ? (
                        <input type="number" className="input-field rounded-lg px-2 py-1 text-xs w-20" value={editForm.minQuantity} onChange={(e) => setEditForm(s => ({ ...s, minQuantity: Number(e.target.value || 0) }))} />
                      ) : (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg"
                          style={isLow ? { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }
                            : { background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                          {isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-muted text-xs font-mono">Today</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <button onClick={() => updateMut.mutate({ id: item._id, qty: item.qty + 1 })}
                          className="w-9 h-9 rounded-xl border border-accent/50 text-accent-bright hover:text-white hover:bg-accent transition-all text-lg font-extrabold">+</button>
                        <button onClick={() => item.qty > 0 && updateMut.mutate({ id: item._id, qty: item.qty - 1 })}
                          className="w-9 h-9 rounded-xl border border-red/50 text-red hover:text-white hover:bg-red transition-all text-lg font-extrabold">−</button>
                        {!isEditing ? (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(item._id)
                                setEditForm({
                                  name: item.name,
                                  category: item.category,
                                  unit: item.unit,
                                  quantity: item.qty,
                                  minQuantity: item.minQty,
                                })
                              }}
                              className="text-xs px-2 py-1 rounded-lg border border-border/50 text-muted"
                            >
                              Edit
                            </button>
                            <button onClick={() => removeMut.mutate(item._id)} className="text-xs px-2 py-1 rounded-lg border border-red/40 text-red">Remove</button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => saveEditMut.mutate({ id: item._id, payload: editForm })}
                              className="text-xs px-2 py-1 rounded-lg bg-accent text-white"
                            >
                              Save
                            </button>
                            <button onClick={() => setEditingId(null)} className="text-xs px-2 py-1 rounded-lg border border-border/50 text-muted">Cancel</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
