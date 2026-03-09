import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'

export default function StaffLogin() {
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, setValue, formState: { errors } } = useForm()

  const fillDemo = (email, pass) => { setValue('email', email); setValue('password', pass) }

  const onSubmit = async ({ email, password }) => {
    setLoading(true)
    try {
      const user = await login(email, password)
      if (!user.isSetupComplete) navigate('/setup')
      else navigate('/dashboard/overview')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-app flex flex-col overflow-hidden relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full blur-[130px]" style={{ background: 'rgba(139,92,246,0.12)' }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[100px]" style={{ background: 'rgba(236,72,153,0.08)' }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-border/50">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
            <span className="text-white text-lg">✦</span>
          </div>
          <span className="font-display font-bold text-xl text-primary">MessMaster</span>
        </Link>
        <Link to="/login/student" className="text-sm text-muted hover:text-primary transition-colors">
          Student Portal →
        </Link>
      </nav>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center flex-1 px-8 py-12 max-w-6xl mx-auto w-full gap-16">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 max-w-lg hidden lg:block"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent-bright text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Staff Administration Portal
          </div>
          <h1 className="font-display text-5xl font-bold leading-tight mb-4 text-primary">
            Manage your<br />
            <span className="italic" style={{ color: '#a78bfa' }}>mess operations.</span>
          </h1>
          <p className="text-muted text-base leading-relaxed mb-8">
            Access analytics, waste tracking, AI predictions, inventory management and more.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {['AI Oracle Predictions', 'Waste Analytics', 'Inventory Alerts', 'Cook Reviews'].map(f => (
              <div key={f} className="glass rounded-xl p-4 text-sm text-muted flex items-center gap-2">
                <span className="text-accent-bright">✦</span> {f}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-md"
        >
          <div className="glass rounded-3xl p-8">
            <h2 className="font-display text-3xl font-bold text-primary mb-1">Welcome back</h2>
            <p className="text-muted text-sm mb-8">Sign in to your staff account</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="text-xs font-medium text-muted uppercase tracking-wider block mb-2">Email</label>
                <input
                  {...register('email', { required: 'Email required' })}
                  type="email"
                  className="input-field w-full rounded-xl px-4 py-3.5 text-primary text-sm"
                  placeholder="ravi@mess.edu"
                />
                {errors.email && <p className="text-red text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div className="relative">
                <label className="text-xs font-medium text-muted uppercase tracking-wider block mb-2">Password</label>
                <input
                  {...register('password', { required: 'Password required' })}
                  type={showPass ? 'text' : 'password'}
                  className="input-field w-full rounded-xl px-4 py-3.5 text-primary text-sm pr-12"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-10 text-muted hover:text-accent-bright transition-colors">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.password && <p className="text-red text-xs mt-1">{errors.password.message}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="btn-accent w-full text-white font-semibold py-4 rounded-xl text-sm mt-2">
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>

            {/* Demo accounts */}
            <div className="mt-6 p-4 rounded-2xl border border-border/50" style={{ background: 'rgba(13,11,26,0.6)' }}>
              <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-3">Demo Accounts</p>
              <div className="space-y-2">
                {[
                  { label: 'Ravi Kumar', email: 'ravi@mess.edu', pass: 'staff123' },
                  { label: 'Priya Sharma', email: 'priya@mess.edu', pass: 'staff456' },
                ].map(d => (
                  <button key={d.email} onClick={() => fillDemo(d.email, d.pass)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-accent/10 transition-colors flex items-center justify-between group">
                    <span className="text-sm text-accent-bright font-medium group-hover:text-accent-light">{d.label}</span>
                    <span className="text-xs text-muted">{d.email}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
