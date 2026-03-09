import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuthStore from '../store/useAuthStore'

const emptyInventory = { name: '', category: 'Other', unit: 'kg', quantity: 0, minimumQuantity: 0 }
const emptyCook = { name: '', role: 'Cook', contactNumber: '' }

export default function RegisterMess() {
  const navigate = useNavigate()
  const { registerMess } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    messName: '',
    phoneNumber: '',
    location: '',
    messCapacity: '',
    numberOfMenuItems: 0,
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    pocName: '',
    pocPhone: '',
    repName: '',
    repEmail: '',
    repPhone: '',
  })
  const [menuItems, setMenuItems] = useState([''])
  const [inventoryItems, setInventoryItems] = useState([emptyInventory])
  const [cooks, setCooks] = useState([emptyCook])

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.messName || !form.phoneNumber || !form.location || !form.adminName || !form.adminEmail || !form.adminPassword || !form.pocName || !form.pocPhone || !form.repName || !form.repEmail || !form.repPhone) {
      toast.error('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      await registerMess({
        ...form,
        menuItems: menuItems.map(m => m.trim()).filter(Boolean),
        inventoryItems: inventoryItems.filter(i => i.name && i.category && i.unit),
        cooks: cooks.filter(c => c.name && c.role),
      })
      toast.success('Mess registered successfully')
      navigate('/dashboard/overview')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Mess registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-app p-6">
      <div className="max-w-5xl mx-auto rounded-3xl p-8 border border-border/50" style={{ background: 'rgba(19,16,42,0.9)' }}>
        <h1 className="font-display text-3xl font-bold text-primary mb-2">Mess Registration</h1>
        <p className="text-muted text-sm mb-7">Set up mess profile, operations, and admin account</p>

        <form onSubmit={submit} className="space-y-8">
          <section>
            <h2 className="text-primary font-semibold mb-3">1. Mess Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="input-field rounded-xl px-4 py-3 text-sm" placeholder="Mess Name*" value={form.messName} onChange={e => setField('messName', e.target.value)} />
              <input className="input-field rounded-xl px-4 py-3 text-sm" placeholder="Phone Number*" value={form.phoneNumber} onChange={e => setField('phoneNumber', e.target.value)} />
              <input className="input-field rounded-xl px-4 py-3 text-sm md:col-span-2" placeholder="Location*" value={form.location} onChange={e => setField('location', e.target.value)} />
              <input className="input-field rounded-xl px-4 py-3 text-sm" type="number" placeholder="Mess Capacity (optional)" value={form.messCapacity} onChange={e => setField('messCapacity', e.target.value)} />
            </div>
          </section>

          <section>
            <h2 className="text-primary font-semibold mb-3">2. Menu Setup</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <input className="input-field rounded-xl px-4 py-3 text-sm" type="number" placeholder="Number of Menu Items" value={form.numberOfMenuItems} onChange={e => setField('numberOfMenuItems', Number(e.target.value || 0))} />
            </div>
            <div className="space-y-2">
              {menuItems.map((item, idx) => (
                <input
                  key={idx}
                  className="input-field rounded-xl px-4 py-3 text-sm w-full"
                  placeholder={`Menu Item ${idx + 1}`}
                  value={item}
                  onChange={e => setMenuItems(prev => prev.map((m, i) => (i === idx ? e.target.value : m)))}
                />
              ))}
              <button type="button" onClick={() => setMenuItems(prev => [...prev, ''])} className="text-xs text-accent-bright">+ Add Menu Item</button>
            </div>
          </section>

          <section>
            <h2 className="text-primary font-semibold mb-3">3. Inventory Setup</h2>
            <div className="space-y-3">
              {inventoryItems.map((inv, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <input className="input-field rounded-xl px-3 py-2 text-sm" placeholder="Name" value={inv.name} onChange={e => setInventoryItems(prev => prev.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))} />
                  <input className="input-field rounded-xl px-3 py-2 text-sm" placeholder="Category" value={inv.category} onChange={e => setInventoryItems(prev => prev.map((x, i) => i === idx ? { ...x, category: e.target.value } : x))} />
                  <input className="input-field rounded-xl px-3 py-2 text-sm" placeholder="Unit" value={inv.unit} onChange={e => setInventoryItems(prev => prev.map((x, i) => i === idx ? { ...x, unit: e.target.value } : x))} />
                  <input className="input-field rounded-xl px-3 py-2 text-sm" type="number" placeholder="Quantity" value={inv.quantity} onChange={e => setInventoryItems(prev => prev.map((x, i) => i === idx ? { ...x, quantity: Number(e.target.value || 0) } : x))} />
                  <input className="input-field rounded-xl px-3 py-2 text-sm" type="number" placeholder="Min Qty" value={inv.minimumQuantity} onChange={e => setInventoryItems(prev => prev.map((x, i) => i === idx ? { ...x, minimumQuantity: Number(e.target.value || 0) } : x))} />
                </div>
              ))}
              <button type="button" onClick={() => setInventoryItems(prev => [...prev, emptyInventory])} className="text-xs text-accent-bright">+ Add Inventory Item</button>
            </div>
          </section>

          <section>
            <h2 className="text-primary font-semibold mb-3">4. Cook Setup</h2>
            <div className="space-y-3">
              {cooks.map((cook, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input className="input-field rounded-xl px-3 py-2 text-sm" placeholder="Cook Name" value={cook.name} onChange={e => setCooks(prev => prev.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))} />
                  <select className="input-field rounded-xl px-3 py-2 text-sm" value={cook.role} onChange={e => setCooks(prev => prev.map((x, i) => i === idx ? { ...x, role: e.target.value } : x))}>
                    {['Head Cook', 'Cook', 'Assistant Cook'].map(r => <option key={r}>{r}</option>)}
                  </select>
                  <input className="input-field rounded-xl px-3 py-2 text-sm" placeholder="Contact Number" value={cook.contactNumber} onChange={e => setCooks(prev => prev.map((x, i) => i === idx ? { ...x, contactNumber: e.target.value } : x))} />
                </div>
              ))}
              <button type="button" onClick={() => setCooks(prev => [...prev, emptyCook])} className="text-xs text-accent-bright">+ Add Cook</button>
            </div>
          </section>

          <section>
            <h2 className="text-primary font-semibold mb-3">5. Admin + Contacts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="input-field rounded-xl px-4 py-3 text-sm" placeholder="Admin Name*" value={form.adminName} onChange={e => setField('adminName', e.target.value)} />
              <input className="input-field rounded-xl px-4 py-3 text-sm" type="email" placeholder="Admin Email*" value={form.adminEmail} onChange={e => setField('adminEmail', e.target.value)} />
              <input className="input-field rounded-xl px-4 py-3 text-sm md:col-span-2" type="password" placeholder="Admin Password*" value={form.adminPassword} onChange={e => setField('adminPassword', e.target.value)} />

              <input className="input-field rounded-xl px-4 py-3 text-sm" placeholder="POC Name*" value={form.pocName} onChange={e => setField('pocName', e.target.value)} />
              <input className="input-field rounded-xl px-4 py-3 text-sm" placeholder="POC Phone*" value={form.pocPhone} onChange={e => setField('pocPhone', e.target.value)} />

              <input className="input-field rounded-xl px-4 py-3 text-sm" placeholder="Representative Name*" value={form.repName} onChange={e => setField('repName', e.target.value)} />
              <input className="input-field rounded-xl px-4 py-3 text-sm" type="email" placeholder="Representative Email*" value={form.repEmail} onChange={e => setField('repEmail', e.target.value)} />
              <input className="input-field rounded-xl px-4 py-3 text-sm md:col-span-2" placeholder="Representative Phone*" value={form.repPhone} onChange={e => setField('repPhone', e.target.value)} />
            </div>
          </section>

          <button type="submit" disabled={loading} className="btn-accent text-white font-semibold px-8 py-3.5 rounded-xl text-sm">
            {loading ? 'Registering Mess...' : 'Register Mess'}
          </button>
        </form>
      </div>
    </div>
  )
}
