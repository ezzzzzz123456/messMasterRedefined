import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { QRCodeSVG } from 'qrcode.react'
import api from '../../api/axios'
import useAuthStore from '../../store/useAuthStore'
import Stars from '../../components/ui/Stars'
import LogoLink from '../../components/ui/LogoLink'

export default function StudentPortal() {
  const { user, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState('feedback')
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      overall: 0,
      taste: 0,
      portion: 0,
      freshness: 0,
      meal: 'Lunch',
      messId: user?.messId || '',
    },
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const { data: history } = useQuery({
    queryKey: ['student-history'],
    queryFn: () => api.get('/feedback/my-history').then(r => r.data),
    enabled: activeTab === 'history',
  })
  const { data: messes } = useQuery({
    queryKey: ['feedback-messes'],
    queryFn: () => api.get('/auth/register/messes').then(r => r.data),
  })

  useEffect(() => {
    const list = messes?.messes || []
    if (user?.messId) {
      setValue('messId', user.messId)
      return
    }
    if (list.length) setValue('messId', list[0]._id)
  }, [messes, user?.messId, setValue])

  const MEALS = ['Breakfast', 'Lunch', 'Dinner']
  const RATINGS = [
    { name: 'overall', label: 'Overall Experience', icon: '⭐', desc: 'How was your meal today?' },
    { name: 'taste', label: 'Taste & Flavor', icon: '🍽️', desc: 'Was the seasoning balanced?' },
    { name: 'portion', label: 'Portion Size', icon: '📏', desc: 'Did it satisfy your hunger?' },
    { name: 'freshness', label: 'Quality & Freshness', icon: '🌿', desc: 'Condition of ingredients?' },
  ]

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await api.post('/feedback', data)
      setSubmitted(true)
      toast.success('Feedback submitted!')
      setActiveTab('history')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit')
    } finally { setLoading(false) }
  }

  const cardStyle = { background: 'linear-gradient(135deg, rgba(26,22,48,0.9), rgba(19,16,42,0.95))', border: '1px solid rgba(139,92,246,0.15)' }
  const studentLoginUrl = `${window.location.origin}/login/student`

  return (
    <div className="min-h-screen bg-app relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[120px]" style={{ background: 'rgba(139,92,246,0.1)' }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[100px]" style={{ background: 'rgba(236,72,153,0.07)' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-border/50" style={{ background: 'rgba(19,16,42,0.8)', backdropFilter: 'blur(10px)' }}>
        <LogoLink />
        <nav className="hidden md:flex items-center gap-1 bg-surface/50 px-2 py-1.5 rounded-full border border-border/50">
          <button onClick={() => setActiveTab('feedback')} className={`px-4 py-2 text-sm rounded-full ${activeTab === 'feedback' ? 'font-bold text-white bg-card' : 'text-muted'}`}>Feedback</button>
          <button onClick={() => setActiveTab('history')} className={`px-4 py-2 text-sm rounded-full ${activeTab === 'history' ? 'font-bold text-white bg-card' : 'text-muted'}`}>History</button>
        </nav>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-primary">{user?.name}</p>
            <p className="text-xs text-muted uppercase tracking-wider">Student</p>
          </div>
          <button onClick={logout} className="text-muted hover:text-red transition-colors text-xs">Sign Out</button>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-10 items-start">
        {/* Left: Form */}
        <div className="flex-1 max-w-xl w-full">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-pink/30 bg-pink/10 text-pink text-xs font-medium mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-pink animate-pulse" />Live Session
            </div>
            <h1 className="font-display text-5xl font-bold text-primary leading-tight">
              Rate your <span className="italic" style={{ color: '#a78bfa' }}>Experience</span>
            </h1>
            <p className="text-muted mt-3 text-lg">Help us curate a better dining experience. Your taste buds matter.</p>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'history' ? (
              <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl p-8" style={cardStyle}>
                <h2 className="font-display text-2xl font-bold text-primary mb-4">Meal Selection History</h2>
                <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
                  {(history?.history || []).map(entry => (
                    <div key={entry._id} className="p-4 rounded-2xl border border-border/40">
                      <div className="flex items-center justify-between">
                        <p className="text-primary font-semibold">{entry.meal}</p>
                        <p className="text-xs text-muted">{new Date(entry.date || entry.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p className="text-xs text-muted mt-1">Mess: {entry.messId?.name || 'Unknown Mess'}</p>
                      <p className="text-xs text-muted mt-1">Overall: {entry.overallRating || '-'}/5</p>
                      {entry.comment ? <p className="text-sm text-muted mt-2">{entry.comment}</p> : null}
                    </div>
                  ))}
                  {!history?.history?.length ? <p className="text-sm text-muted">No history available yet.</p> : null}
                </div>
              </motion.div>
            ) : submitted ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="rounded-3xl p-10 text-center" style={cardStyle}>
                <div className="text-6xl mb-4">✅</div>
                <h2 className="font-display text-2xl font-bold text-primary mb-2">Thank you!</h2>
                <p className="text-muted text-sm mb-6">Your feedback helps improve campus dining for everyone.</p>
                <button onClick={() => { setSubmitted(false); reset(); setActiveTab('feedback') }}
                  className="btn-accent text-white font-semibold px-8 py-3 rounded-xl text-sm">
                  Submit Again
                </button>
              </motion.div>
            ) : (
              <motion.div key="form" className="rounded-3xl p-8" style={cardStyle}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Meal selector */}
                  <div>
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Mess</label>
                    <select {...register('messId', { required: true })} className="input-field w-full rounded-xl px-4 py-3 text-primary text-sm mb-3">
                      {(messes?.messes || []).map(m => (
                        <option key={m._id} value={m._id}>{m.name} ({m.location})</option>
                      ))}
                    </select>
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Meal Service</label>
                    <div className="grid grid-cols-3 gap-2 p-1 rounded-xl" style={{ background: 'rgba(13,11,26,0.8)', border: '1px solid rgba(139,92,246,0.2)' }}>
                      {MEALS.map(m => (
                        <label key={m} className="cursor-pointer">
                          <input type="radio" {...register('meal')} value={m} className="sr-only peer" />
                          <div className="text-center py-2 rounded-lg text-xs font-medium text-muted peer-checked:bg-accent peer-checked:text-white transition-all">{m}</div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Star ratings */}
                  {RATINGS.map(r => (
                    <div key={r.name} className="p-4 rounded-2xl" style={{ background: 'rgba(13,11,26,0.5)', border: '1px solid rgba(139,92,246,0.1)' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xl">{r.icon}</span>
                        <div>
                          <h3 className="font-semibold text-primary text-sm">{r.label}</h3>
                          <p className="text-xs text-muted">{r.desc}</p>
                        </div>
                      </div>
                      <Stars value={watch(r.name)} onChange={v => setValue(r.name, v)} size={28} />
                    </div>
                  ))}

                  {/* Comment */}
                  <div>
                    <label className="text-sm font-semibold text-primary block mb-2">Detailed Insights <span className="text-muted font-normal">(Optional)</span></label>
                    <textarea {...register('comment')} rows={3}
                      className="input-field w-full rounded-xl px-4 py-3 text-primary text-sm resize-none"
                      placeholder="The paneer was excellent, but the rice felt a bit undercooked..." />
                  </div>

                  <button type="submit" disabled={loading} className="btn-accent w-full text-white font-bold py-4 rounded-xl text-sm flex items-center justify-center gap-2">
                    {loading ? 'Submitting...' : <><span>Submit Feedback</span><span>→</span></>}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: QR + Stats */}
        <div className="w-full lg:w-80 flex flex-col gap-5 shrink-0">
          {/* QR Card */}
          <div className="rounded-3xl p-1 overflow-hidden relative" style={cardStyle}>
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, #8b5cf6, #ec4899, #8b5cf6)' }} />
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-xl text-primary">Mess Check-in</h2>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />Active
                </div>
              </div>

              <div className="mx-auto w-44 h-44 rounded-2xl flex items-center justify-center mb-5 relative overflow-hidden"
                style={{ background: 'white', border: '3px solid rgba(139,92,246,0.3)' }}>
                <QRCodeSVG value={studentLoginUrl} size={150} includeMargin />
              </div>

              <p className="text-xs text-muted text-center mb-4">Scan to open Student Login directly</p>
              <a href={studentLoginUrl} className="w-full py-2.5 rounded-xl border border-border text-sm font-semibold text-muted hover:text-primary hover:border-accent/50 transition-all flex items-center justify-center gap-2">
                Open Student Login
              </a>
            </div>
          </div>

          {/* Community Goal */}
          <div className="rounded-3xl p-6 relative overflow-hidden" style={cardStyle}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Community Goal</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-bold text-primary">12.5</span>
                  <span className="text-muted text-sm">kg</span>
                </div>
                <p className="text-sm text-muted mt-1">Food waste today</p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold text-green" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  ↓ 5% Less than avg
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <span className="text-2xl">🌱</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
