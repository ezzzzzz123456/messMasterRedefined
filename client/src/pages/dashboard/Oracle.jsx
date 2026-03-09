import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import Badge from '../../components/ui/Badge'

const SCAN_STEPS = [
  'Initializing neural network...',
  'Loading historical waste patterns...',
  'Applying day-of-week multiplier...',
  'Analyzing weather impact...',
  'Processing campus event modifier...',
  'Computing confidence score...',
  'Generating action recommendations...',
  'Prediction complete.',
]

const riskColor = { CRITICAL: 'red', HIGH: 'orange', MODERATE: 'yellow', LOW: 'green' }

export default function Oracle() {
  const { register, handleSubmit } = useForm()
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const runPrediction = async (data) => {
    setResult(null); setScanning(true); setProgress(0)
    let step = 0
    const interval = setInterval(() => {
      step++
      setProgress(Math.min((step / SCAN_STEPS.length) * 100, 100))
      if (step >= SCAN_STEPS.length) clearInterval(interval)
    }, 250)
    try {
      await new Promise(r => setTimeout(r, 2200))
      const res = await api.post('/oracle/predict', data)
      setResult(res.data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Prediction failed')
    } finally { setScanning(false) }
  }

  const cardStyle = { background: 'linear-gradient(135deg, rgba(26,22,48,0.9), rgba(19,16,42,0.95))', border: '1px solid rgba(139,92,246,0.15)' }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent-bright text-xs font-medium mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Oracle Engine v3.0 · LIVE
        </div>
        <h1 className="font-display text-3xl font-bold text-primary">Engine Configuration</h1>
        <p className="text-muted text-sm mt-1">Configure input variables for the neural network model to forecast potential waste generation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form — 2 cols */}
        <div className="lg:col-span-2 rounded-2xl p-6 space-y-4" style={cardStyle}>
          <form onSubmit={handleSubmit(runPrediction)} className="space-y-4">
            {/* Meal toggle */}
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">🍽️ Meal Service</label>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl" style={{ background: 'rgba(13,11,26,0.8)', border: '1px solid rgba(139,92,246,0.2)' }}>
                {['Breakfast', 'Lunch', 'Dinner'].map(m => (
                  <label key={m} className="cursor-pointer">
                    <input type="radio" {...register('meal')} value={m} className="sr-only peer" defaultChecked={m === 'Breakfast'} />
                    <div className="text-center py-2 rounded-lg text-xs font-medium text-muted peer-checked:bg-accent peer-checked:text-white transition-all">{m}</div>
                  </label>
                ))}
              </div>
            </div>

            {[
              { label: '🍛 Primary Entrée', name: 'menu', options: ['Chole Bhature', 'Dal Makhani', 'Kadhi Chawal', 'Rajma Rice', 'Veg Biryani', 'Paneer Butter Masala', 'Aloo Paratha', 'Pav Bhaji', 'Idli Sambar', 'Poha'] },
              { label: '📅 Day of Week', name: 'day', options: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
              { label: '🌤️ Weather', name: 'weather', options: ['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Very Hot'] },
              { label: '🎓 Campus Event', name: 'event', options: ['None', 'Exam Week', 'Holiday', 'Sports Day', 'Cultural Fest', 'Long Weekend'] },
            ].map(f => (
              <div key={f.name}>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">{f.label}</label>
                <div className="relative">
                  <select {...register(f.name)} className="input-field w-full rounded-xl px-4 py-3 text-sm text-primary appearance-none cursor-pointer">
                    {f.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                  <span className="absolute right-3 top-3.5 text-muted pointer-events-none text-xs">▼</span>
                </div>
              </div>
            ))}

            <button type="submit" disabled={scanning}
              className="btn-accent w-full text-white font-bold py-4 rounded-xl text-sm mt-2 flex items-center justify-center gap-2">
              <span>⚡</span>
              {scanning ? 'Analyzing...' : 'Execute Prediction Model'}
            </button>
          </form>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { label: 'Previous Cycle', value: '12.5 kg', bar: 45 },
              { label: 'Model Accuracy', value: '98.2%', bar: 98 },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-xl" style={{ background: 'rgba(13,11,26,0.6)', border: '1px solid rgba(139,92,246,0.1)' }}>
                <p className="text-xs text-muted mb-1">{s.label}</p>
                <p className="font-display text-lg font-bold text-primary">{s.value}</p>
                <div className="w-full h-1 rounded-full mt-2" style={{ background: '#2d2550' }}>
                  <div className="h-full rounded-full" style={{ width: `${s.bar}%`, background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Result Panel — 3 cols */}
        <div className="lg:col-span-3 rounded-2xl overflow-hidden" style={cardStyle}>
          {/* Terminal header */}
          <div className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: 'rgba(139,92,246,0.15)', background: 'rgba(13,11,26,0.4)' }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-mono font-medium" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />LIVE
              </div>
              <span className="text-xs text-muted">Oracle Engine v3.0</span>
            </div>
            <div className="flex gap-4 text-xs text-muted font-mono">
              <span>LATENCY: 12ms</span>
              <span>CONFIDENCE: HIGH</span>
            </div>
          </div>

          <div className="p-6 min-h-80">
            <AnimatePresence mode="wait">
              {scanning && (
                <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  {/* AI Core */}
                  <div className="flex flex-col items-center py-8">
                    <div className="relative w-24 h-24 mb-6">
                      <div className="absolute inset-0 rounded-full border border-accent/20 animate-spin" style={{ animationDuration: '10s' }} />
                      <div className="absolute inset-[-8px] rounded-full border-t-2 border-accent/40 animate-spin" style={{ animationDuration: '4s' }} />
                      <div className="w-24 h-24 rounded-2xl rotate-45 flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #8b5cf6, #4c1d95)', boxShadow: '0 0 50px rgba(139,92,246,0.5)' }}>
                        <span className="text-white text-2xl -rotate-45">🧠</span>
                      </div>
                    </div>
                    <p className="text-accent-bright font-mono text-sm animate-pulse">Processing...</p>
                  </div>

                  {/* Terminal */}
                  <div className="rounded-xl p-4 font-mono text-xs min-h-20" style={{ background: 'rgba(13,11,26,0.8)', border: '1px solid rgba(139,92,246,0.15)' }}>
                    {SCAN_STEPS.slice(0, Math.ceil((progress / 100) * SCAN_STEPS.length)).map((step, i) => (
                      <div key={i} className="mb-1 text-accent-bright">&gt; {step}</div>
                    ))}
                    <span className="animate-pulse text-accent-bright">█</span>
                  </div>

                  <div className="w-full rounded-full h-1.5" style={{ background: '#2d2550' }}>
                    <motion.div className="h-1.5 rounded-full" style={{ background: 'linear-gradient(90deg, #8b5cf6, #c084fc)' }}
                      animate={{ width: `${progress}%` }} transition={{ duration: 0.2 }} />
                  </div>
                  <p className="text-xs text-muted text-right font-mono">{Math.round(progress)}%</p>
                </motion.div>
              )}

              {!scanning && !result && (
                <motion.div key="idle" className="h-64 flex flex-col items-center justify-center text-center">
                  <div className="text-6xl mb-4 opacity-20">🔮</div>
                  <p className="text-muted text-sm">Configure parameters and run the prediction model</p>
                </motion.div>
              )}

              {!scanning && result && (
                <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-6">
                  {/* Big number */}
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <Badge color={riskColor[result.riskLevel] || 'green'} className="mb-3">{result.riskLevel} RISK</Badge>
                    <div className="font-display text-6xl font-bold text-primary" style={{ textShadow: '0 0 30px rgba(139,92,246,0.5)' }}>
                      {result.predictedKg}
                    </div>
                    <p className="text-muted text-sm mt-1">kg Predicted Wastage</p>
                    <p className="text-xs text-accent-bright mt-1">Confidence: {result.confidence}%</p>

                    <div className="grid grid-cols-2 gap-3 mt-5 w-full">
                      <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                        <p className="text-xs text-muted">Cost Loss</p>
                        <p className="font-display text-xl font-bold text-red">₹{result.costLoss}</p>
                      </div>
                      <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
                        <p className="text-xs text-muted">CO₂ Impact</p>
                        <p className="font-display text-xl font-bold text-accent-bright">{result.co2Kg} kg</p>
                      </div>
                    </div>
                  </div>

                  {/* Analysis */}
                  <div className="flex-1 space-y-4">
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">📊 Analysis Report</h3>
                    {[
                      { label: 'Risk Assessment', value: result.riskLevel, pct: result.riskLevel === 'LOW' ? 24 : result.riskLevel === 'MODERATE' ? 50 : result.riskLevel === 'HIGH' ? 75 : 95 },
                      { label: 'Historical Correlation', value: `${result.confidence}% MATCH`, pct: result.confidence },
                    ].map(m => (
                      <div key={m.label}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-muted">{m.label}</span>
                          <span className="text-accent-bright font-mono">{m.value}</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: '#2d2550' }}>
                          <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' }} />
                        </div>
                      </div>
                    ))}

                    <div className="pt-3 mt-2 border-t border-border/30">
                      <p className="text-xs text-muted uppercase tracking-wider mb-3">Recommended Actions</p>
                      <div className="space-y-2">
                        {result.actions?.slice(0, 3).map((action, i) => (
                          <div key={i} className="flex gap-2 text-xs p-2 rounded-lg" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
                            <span className="text-accent-bright shrink-0">✦</span>
                            <span className="text-primary">{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
