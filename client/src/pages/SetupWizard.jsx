import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../api/axios'
import useAuthStore from '../store/useAuthStore'

const STEPS = ['Mess Details', 'Food Menu', 'Staff Members', 'Launch']

const SAMPLE_MENU = [
  { name: 'Chole Bhature', category: 'Main Course' },
  { name: 'Dal Makhani', category: 'Main Course' },
  { name: 'Veg Biryani', category: 'Main Course' },
  { name: 'Paneer Butter Masala', category: 'Main Course' },
  { name: 'Idli Sambar', category: 'Breakfast' },
  { name: 'Aloo Paratha', category: 'Breakfast' },
  { name: 'Pav Bhaji', category: 'Snacks' },
  { name: 'Rajma Rice', category: 'Main Course' },
]

const SAMPLE_STAFF = [
  { name: 'Ramesh Yadav', role: 'Head Cook', phone: '9876501234', speciality: 'North Indian' },
  { name: 'Sunita Devi', role: 'Cook', phone: '9876502345', speciality: 'South Indian' },
  { name: 'Mohan Lal', role: 'Assistant Cook', phone: '9876503456', speciality: 'Continental' },
]

export default function SetupWizard() {
  const [step, setStep] = useState(0)
  const [messData, setMessData] = useState(null)
  const [menuItems, setMenuItems] = useState([{ name: '', category: 'Main Course' }])
  const [staffList, setStaffList] = useState([{ name: '', role: 'Cook', phone: '', speciality: '' }])
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, setValue } = useForm()
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()

  const fillSample = () => {
    setValue('name', 'Hostel H4 Mess')
    setValue('capacity', 500)
    setValue('established', 2010)
    setValue('phone', '9876543210')
    setValue('address', 'Hostel H4, IIT Campus, Chennai - 600036')
  }

  const onMessSubmit = (data) => {
    setMessData(data)
    setStep(1)
  }

  const launch = async () => {
    setLoading(true)
    try {
      const messRes = await api.post('/mess', messData)
      const messId = messRes.data._id

      await Promise.all([
        ...menuItems.filter(i => i.name).map(item => api.post('/menu-items', { ...item, messId })),
        ...staffList.filter(s => s.name).map(staff => api.post('/staff', { ...staff, messId })),
      ])

      await api.put(`/mess/${messId}`, { isActive: true })

      // Mark setup complete
      const meRes = await api.get('/auth/me')
      setUser({ ...meRes.data, isSetupComplete: true })

      toast.success('🚀 MessMaster launched!')
      navigate('/dashboard/overview')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Setup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-app flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-green">Setup Wizard</h1>
          <p className="text-muted mt-1">Configure your mess in 4 steps</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 ${i <= step ? 'text-green' : 'text-muted'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${i < step ? 'bg-green border-green text-app' : i === step ? 'border-green text-green' : 'border-border text-muted'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="text-xs hidden sm:block">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-2" style={{ background: i < step ? '#00e676' : '#1a2a3a' }} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="bg-card border border-border rounded-2xl p-8"
          >
            {step === 0 && (
              <form onSubmit={handleSubmit(onMessSubmit)} className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-display text-xl text-primary">Mess Details</h2>
                  <button type="button" onClick={fillSample} className="text-xs text-green hover:underline">Fill Sample Data</button>
                </div>
                {[
                  { name: 'name', label: 'Mess Name', placeholder: 'Hostel H4 Mess' },
                  { name: 'capacity', label: 'Capacity (students)', placeholder: '500', type: 'number' },
                  { name: 'established', label: 'Established Year', placeholder: '2010', type: 'number' },
                  { name: 'phone', label: 'Phone', placeholder: '9876543210' },
                  { name: 'address', label: 'Address', placeholder: 'Hostel H4, IIT Campus...' },
                ].map(f => (
                  <div key={f.name}>
                    <label className="text-xs text-muted uppercase tracking-wider block mb-1">{f.label}</label>
                    <input {...register(f.name, { required: true })} type={f.type || 'text'} placeholder={f.placeholder}
                      className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-primary focus:outline-none focus:border-green text-sm" />
                  </div>
                ))}
                <button type="submit" className="w-full py-3 rounded-lg font-semibold bg-green text-app mt-4">Next →</button>
              </form>
            )}

            {step === 1 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-display text-xl text-primary">Food Menu</h2>
                  <button onClick={() => setMenuItems(SAMPLE_MENU)} className="text-xs text-green hover:underline">Load Sample Menu</button>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
                  {menuItems.map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <input value={item.name} onChange={e => { const n = [...menuItems]; n[i].name = e.target.value; setMenuItems(n) }}
                        placeholder="Dish name" className="flex-1 bg-surface border border-border rounded px-3 py-2 text-sm text-primary focus:outline-none focus:border-green" />
                      <select value={item.category} onChange={e => { const n = [...menuItems]; n[i].category = e.target.value; setMenuItems(n) }}
                        className="bg-surface border border-border rounded px-2 py-2 text-sm text-primary focus:outline-none focus:border-green">
                        {['Breakfast', 'Main Course', 'Side Dish', 'Snacks', 'Dessert', 'Beverages'].map(c => <option key={c}>{c}</option>)}
                      </select>
                      <button onClick={() => setMenuItems(menuItems.filter((_, j) => j !== i))} className="text-red hover:text-red px-2">✕</button>
                    </div>
                  ))}
                </div>
                <button onClick={() => setMenuItems([...menuItems, { name: '', category: 'Main Course' }])} className="text-green text-sm hover:underline mb-4">+ Add Item</button>
                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="flex-1 py-2 rounded-lg border border-border text-muted">← Back</button>
                  <button onClick={() => setStep(2)} className="flex-1 py-2 rounded-lg bg-green text-app font-semibold">Next →</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-display text-xl text-primary">Staff Members</h2>
                  <button onClick={() => setStaffList(SAMPLE_STAFF)} className="text-xs text-green hover:underline">Load Sample Staff</button>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
                  {staffList.map((s, i) => (
                    <div key={i} className="flex gap-2">
                      <input value={s.name} onChange={e => { const n = [...staffList]; n[i].name = e.target.value; setStaffList(n) }}
                        placeholder="Name" className="flex-1 bg-surface border border-border rounded px-3 py-2 text-sm text-primary focus:outline-none focus:border-green" />
                      <select value={s.role} onChange={e => { const n = [...staffList]; n[i].role = e.target.value; setStaffList(n) }}
                        className="bg-surface border border-border rounded px-2 py-2 text-sm text-primary focus:outline-none focus:border-green">
                        {['Head Cook', 'Cook', 'Assistant Cook', 'Helper', 'Store Keeper', 'Manager'].map(r => <option key={r}>{r}</option>)}
                      </select>
                      <button onClick={() => setStaffList(staffList.filter((_, j) => j !== i))} className="text-red px-2">✕</button>
                    </div>
                  ))}
                </div>
                <button onClick={() => setStaffList([...staffList, { name: '', role: 'Cook', phone: '', speciality: '' }])} className="text-green text-sm hover:underline mb-4">+ Add Staff</button>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 py-2 rounded-lg border border-border text-muted">← Back</button>
                  <button onClick={() => setStep(3)} className="flex-1 py-2 rounded-lg bg-green text-app font-semibold">Next →</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-center">
                <div className="text-5xl mb-4">🚀</div>
                <h2 className="font-display text-2xl text-primary mb-2">Ready to Launch!</h2>
                <p className="text-muted text-sm mb-6">Everything is configured and ready.</p>
                <div className="grid grid-cols-3 gap-4 mb-8 text-center">
                  {[
                    { label: 'Menu Items', value: menuItems.filter(i => i.name).length, icon: '🍛' },
                    { label: 'Staff Members', value: staffList.filter(s => s.name).length, icon: '👨‍🍳' },
                    { label: 'Modules', value: 8, icon: '📊' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-surface rounded-lg p-4 border border-border">
                      <div className="text-2xl mb-1">{stat.icon}</div>
                      <div className="font-display text-2xl text-green">{stat.value}</div>
                      <div className="text-xs text-muted">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 py-2 rounded-lg border border-border text-muted">← Back</button>
                  <button onClick={launch} disabled={loading}
                    className="flex-1 py-3 rounded-lg font-bold text-app transition-all"
                    style={{ background: loading ? '#4a5f7a' : '#00e676' }}>
                    {loading ? 'Launching...' : '🚀 Launch MessMaster'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
