import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../api/axios'

const TABS = ['Mess Info', 'Menu Items', 'Staff Members']

export default function SetupPage() {
  const [tab, setTab] = useState(0)
  const [editingStaffId, setEditingStaffId] = useState(null)
  const [editingStaff, setEditingStaff] = useState({ name: '', role: 'Cook', speciality: '', contactNumber: '' })
  const qc = useQueryClient()
  const cardStyle = { background: 'linear-gradient(135deg, rgba(26,22,48,0.9), rgba(19,16,42,0.95))', border: '1px solid rgba(139,92,246,0.15)' }

  const { data: mess } = useQuery({ queryKey: ['mess'], queryFn: () => api.get('/mess/me').then(r => r.data) })
  const { data: menu } = useQuery({ queryKey: ['menu-items'], queryFn: () => api.get('/menu-items').then(r => r.data) })
  const { data: staff } = useQuery({ queryKey: ['staff'], queryFn: () => api.get('/staff').then(r => r.data) })

  const { register: rM, handleSubmit: hM } = useForm({ values: mess })
  const { register: rMI, handleSubmit: hMI, reset: resetMI } = useForm()
  const { register: rS, handleSubmit: hS, reset: resetS } = useForm()

  const updateMess = useMutation({ mutationFn: d => api.patch('/mess/me', d), onSuccess: () => toast.success('Updated!') })
  const addMenu = useMutation({ mutationFn: d => api.post('/menu-items', d), onSuccess: () => { toast.success('Added!'); resetMI(); qc.invalidateQueries(['menu-items']) } })
  const addStaff = useMutation({ mutationFn: d => api.post('/staff', d), onSuccess: () => { toast.success('Added!'); resetS(); qc.invalidateQueries(['staff']) } })
  const updateStaff = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/staff/${id}`, payload),
    onSuccess: () => {
      toast.success('Staff updated')
      setEditingStaffId(null)
      qc.invalidateQueries(['staff'])
    },
  })
  const removeStaff = useMutation({
    mutationFn: (id) => api.delete(`/staff/${id}`),
    onSuccess: () => {
      toast.success('Staff removed')
      qc.invalidateQueries(['staff'])
    },
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-3xl font-bold text-primary">Settings</h1>
        <p className="text-muted text-sm mt-1">Configure your mess information and data</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-2xl" style={{ background: 'rgba(13,11,26,0.8)', border: '1px solid rgba(139,92,246,0.15)' }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === i ? 'text-white' : 'text-muted hover:text-primary'}`}
            style={tab === i ? { background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' } : {}}>
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div className="rounded-2xl p-6" style={cardStyle}>
          <h3 className="font-display font-bold text-lg text-primary mb-5">Mess Information</h3>
          <form onSubmit={hM(d => updateMess.mutate(d))} className="space-y-4">
            {[
              { label: 'Mess Name', name: 'name', placeholder: 'Hostel H4 Mess' },
              { label: 'Address', name: 'address', placeholder: 'Block A, Hostel H4' },
              { label: 'Capacity', name: 'capacity', placeholder: '500', type: 'number' },
            ].map(f => (
              <div key={f.name}>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">{f.label}</label>
                <input {...rM(f.name)} type={f.type || 'text'} className="input-field w-full rounded-xl px-4 py-3 text-primary text-sm" placeholder={f.placeholder} />
              </div>
            ))}
            <button type="submit" disabled={updateMess.isPending} className="btn-accent text-white font-bold px-6 py-3 rounded-xl text-sm">
              {updateMess.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {tab === 1 && (
        <div className="space-y-4">
          <div className="rounded-2xl p-6" style={cardStyle}>
            <h3 className="font-display font-bold text-lg text-primary mb-4">Add Menu Item</h3>
            <form onSubmit={hMI(d => addMenu.mutate(d))} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Name</label>
                <input {...rMI('name', { required: true })} className="input-field w-full rounded-xl px-4 py-3 text-primary text-sm" placeholder="Dal Makhani" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Category</label>
                <select {...rMI('category', { required: true })} className="input-field w-full rounded-xl px-4 py-3 text-primary text-sm">
                  {['Breakfast', 'Main Course', 'Side Dish', 'Snacks', 'Dessert', 'Beverages'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Avg Waste (kg)</label>
                <input {...rMI('avgWasteKg')} type="number" step="0.1" className="input-field w-full rounded-xl px-4 py-3 text-primary text-sm" placeholder="0" />
              </div>
              <div className="col-span-2">
                <button type="submit" className="btn-accent text-white font-bold px-6 py-3 rounded-xl text-sm">+ Add Item</button>
              </div>
            </form>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(menu?.items || []).map(item => (
              <div key={item._id} className="p-4 rounded-xl flex items-center gap-3" style={{ background: 'rgba(26,22,48,0.7)', border: '1px solid rgba(139,92,246,0.1)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: 'rgba(139,92,246,0.15)' }}>🍛</div>
                <div>
                  <p className="text-sm font-semibold text-primary">{item.name}</p>
                  <p className="text-xs text-muted">{item.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 2 && (
        <div className="space-y-4">
          <div className="rounded-2xl p-6" style={cardStyle}>
            <h3 className="font-display font-bold text-lg text-primary mb-4">Add Staff Member</h3>
            <form onSubmit={hS(d => addStaff.mutate(d))} className="grid grid-cols-2 gap-4">
              {[
                { label: 'Name', name: 'name', placeholder: 'Rajesh Kumar', full: true },
                { label: 'Role', name: 'role', placeholder: 'Head Cook' },
                { label: 'Speciality', name: 'speciality', placeholder: 'North Indian' },
              ].map(f => (
                <div key={f.name} className={f.full ? 'col-span-2' : ''}>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">{f.label}</label>
                  {f.name === 'role' ? (
                    <select {...rS('role', { required: true })} className="input-field w-full rounded-xl px-4 py-3 text-primary text-sm">
                      {['Head Cook', 'Cook', 'Assistant Cook', 'Helper', 'Store Keeper', 'Manager'].map(r => <option key={r}>{r}</option>)}
                    </select>
                  ) : (
                    <input {...rS(f.name, { required: !f.optional })} className="input-field w-full rounded-xl px-4 py-3 text-primary text-sm" placeholder={f.placeholder} />
                  )}
                </div>
              ))}
              <div className="col-span-2">
                <button type="submit" className="btn-accent text-white font-bold px-6 py-3 rounded-xl text-sm">+ Add Staff</button>
              </div>
            </form>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(staff?.staff || []).map(s => (
              <div key={s._id} className="p-4 rounded-xl flex items-center gap-3" style={{ background: 'rgba(26,22,48,0.7)', border: '1px solid rgba(139,92,246,0.1)' }}>
                {editingStaffId === s._id ? (
                  <div className="w-full space-y-2">
                    <input className="input-field w-full rounded-lg px-3 py-2 text-xs" value={editingStaff.name} onChange={(e) => setEditingStaff(prev => ({ ...prev, name: e.target.value }))} />
                    <div className="grid grid-cols-2 gap-2">
                      <select className="input-field w-full rounded-lg px-3 py-2 text-xs" value={editingStaff.role} onChange={(e) => setEditingStaff(prev => ({ ...prev, role: e.target.value }))}>
                        {['Head Cook', 'Cook', 'Assistant Cook', 'Helper', 'Store Keeper', 'Manager'].map(r => <option key={r}>{r}</option>)}
                      </select>
                      <input className="input-field w-full rounded-lg px-3 py-2 text-xs" placeholder="Speciality" value={editingStaff.speciality || ''} onChange={(e) => setEditingStaff(prev => ({ ...prev, speciality: e.target.value }))} />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => updateStaff.mutate({ id: s._id, payload: editingStaff })} className="text-xs px-3 py-1.5 rounded-lg bg-accent text-white">Save</button>
                      <button onClick={() => setEditingStaffId(null)} className="text-xs px-3 py-1.5 rounded-lg border border-border/50 text-muted">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
                      style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                      {s.name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-primary">{s.name}</p>
                      <p className="text-xs text-muted">{s.role}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingStaffId(s._id)
                          setEditingStaff({
                            name: s.name || '',
                            role: s.role || 'Cook',
                            speciality: s.speciality || '',
                            contactNumber: s.contactNumber || s.phone || '',
                          })
                        }}
                        className="text-xs px-2 py-1 rounded-lg border border-border/50 text-muted"
                      >
                        Edit
                      </button>
                      <button onClick={() => removeStaff.mutate(s._id)} className="text-xs px-2 py-1 rounded-lg border border-red/40 text-red">Delete</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
