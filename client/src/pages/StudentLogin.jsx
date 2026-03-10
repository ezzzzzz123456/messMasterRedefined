import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import LogoLink from '../components/ui/LogoLink'

export default function StudentLogin() {
  const { login, register: registerUser } = useAuthStore()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const { register, handleSubmit, setValue, formState: { errors } } = useForm()

  const fillDemo = (email, pass) => { setValue('email', email); setValue('password', pass) }

  const onSubmit = async ({ name, email, password, rollNo, year }) => {
    setLoading(true)
    try {
      if (isRegisterMode) {
        await registerUser({
          name,
          email,
          password,
          role: 'student',
          rollNo,
          year: year ? Number(year) : undefined,
        })
        toast.success('Registration successful')
      } else {
        await login(email, password)
      }
      navigate('/student/feedback')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Request failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-app flex flex-col overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px]" style={{ background: 'rgba(139,92,246,0.12)' }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[100px]" style={{ background: 'rgba(236,72,153,0.08)' }} />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-border/50">
        <LogoLink />
        <Link to="/login/staff" className="text-sm text-muted hover:text-primary transition-colors">
          Staff Portal →
        </Link>
      </nav>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center flex-1 px-8 py-12 max-w-6xl mx-auto w-full gap-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="glass rounded-3xl p-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.2))' }}>
              <span className="text-2xl">🎓</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-primary mb-1">{isRegisterMode ? 'Student Registration' : 'Student Login'}</h2>
            <p className="text-muted text-sm mb-5">{isRegisterMode ? 'Create your student account' : 'Rate your meals & track dining experience'}</p>

            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl mb-6" style={{ background: 'rgba(13,11,26,0.8)', border: '1px solid rgba(139,92,246,0.2)' }}>
              <button type="button" onClick={() => setIsRegisterMode(false)}
                className={`py-2 rounded-lg text-sm font-medium ${!isRegisterMode ? 'bg-accent text-white' : 'text-muted'}`}>
                Login
              </button>
              <button type="button" onClick={() => setIsRegisterMode(true)}
                className={`py-2 rounded-lg text-sm font-medium ${isRegisterMode ? 'bg-accent text-white' : 'text-muted'}`}>
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {isRegisterMode && (
                <>
                  <div>
                    <label className="text-xs font-medium text-muted uppercase tracking-wider block mb-2">Full Name</label>
                    <input
                      {...register('name', { required: 'Name required' })}
                      type="text"
                      className="input-field w-full rounded-xl px-4 py-3.5 text-primary text-sm"
                      placeholder="Aman Verma"
                    />
                    {errors.name && <p className="text-red text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted uppercase tracking-wider block mb-2">Roll No</label>
                      <input
                        {...register('rollNo', { required: 'Roll no required' })}
                        type="text"
                        className="input-field w-full rounded-xl px-4 py-3.5 text-primary text-sm"
                        placeholder="CS22B109"
                      />
                      {errors.rollNo && <p className="text-red text-xs mt-1">{errors.rollNo.message}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted uppercase tracking-wider block mb-2">Year</label>
                      <input
                        {...register('year', { required: 'Year required', min: 1, max: 5 })}
                        type="number"
                        className="input-field w-full rounded-xl px-4 py-3.5 text-primary text-sm"
                        placeholder="2"
                      />
                      {errors.year && <p className="text-red text-xs mt-1">{errors.year.message}</p>}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-xs font-medium text-muted uppercase tracking-wider block mb-2">Email</label>
                <input
                  {...register('email', { required: 'Email required' })}
                  type="email"
                  className="input-field w-full rounded-xl px-4 py-3.5 text-primary text-sm"
                  placeholder="arjun@student.edu"
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
                className="btn-accent w-full text-white font-semibold py-4 rounded-xl text-sm">
                {loading ? (isRegisterMode ? 'Creating account...' : 'Signing in...') : (isRegisterMode ? 'Create Account →' : 'Sign In →')}
              </button>
            </form>

            {!isRegisterMode && <div className="mt-6 p-4 rounded-2xl border border-border/50" style={{ background: 'rgba(13,11,26,0.6)' }}>
              <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-3">Demo Accounts</p>
              <div className="space-y-2">
                {[
                  { label: 'Arjun Verma', email: 'arjun@student.edu', pass: 'stu123' },
                  { label: 'Sneha Patel', email: 'sneha@student.edu', pass: 'stu456' },
                ].map(d => (
                  <button key={d.email} onClick={() => fillDemo(d.email, d.pass)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-accent/10 transition-colors flex items-center justify-between group">
                    <span className="text-sm text-accent-bright font-medium">{d.label}</span>
                    <span className="text-xs text-muted">{d.email}</span>
                  </button>
                ))}
              </div>
            </div>}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 max-w-lg hidden lg:block"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-pink/30 bg-pink/10 text-pink text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-pink animate-pulse" />
            Live Session Active
          </div>
          <h1 className="font-display text-5xl font-bold leading-tight mb-4 text-primary">
            Rate your<br />
            <span className="italic" style={{ color: '#a78bfa' }}>experience.</span>
          </h1>
          <p className="text-muted text-base leading-relaxed mb-8">
            Help us curate a better dining experience. Your taste buds matter.
          </p>
          <div className="glass rounded-2xl p-5">
            <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-3">Community Goal</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-display text-4xl font-bold text-primary">12.5</span>
              <span className="text-muted text-sm">kg food waste today</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs px-2 py-1 rounded-lg text-green font-medium" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                ↓ 5% Less than avg
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
