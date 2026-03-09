import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import api from '../../api/axios'
import Stars from '../../components/ui/Stars'

export default function FeedbackPage() {
  const { data: summary } = useQuery({ queryKey: ['feedback-summary'], queryFn: () => api.get('/feedback/summary').then(r => r.data) })
  const { data: recent } = useQuery({ queryKey: ['feedback-recent'], queryFn: () => api.get('/feedback/recent').then(r => r.data) })
  const cardStyle = { background: 'linear-gradient(135deg, rgba(26,22,48,0.9), rgba(19,16,42,0.95))', border: '1px solid rgba(139,92,246,0.15)' }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-primary">Student Feedback</h1>
        <p className="text-muted text-sm mt-1">Aggregated ratings and recent reviews</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Overall', value: summary?.avgOverall, icon: '⭐' },
          { label: 'Taste', value: summary?.avgTaste, icon: '🍽️' },
          { label: 'Portion', value: summary?.avgPortion, icon: '📏' },
          { label: 'Freshness', value: summary?.avgFreshness, icon: '🌿' },
        ].map(m => (
          <div key={m.label} className="rounded-2xl p-5 text-center" style={cardStyle}>
            <span className="text-2xl">{m.icon}</span>
            <p className="font-display text-3xl font-bold text-primary mt-2">{(m.value || 0).toFixed(1)}</p>
            <p className="text-xs text-muted mt-1">{m.label}</p>
            <div className="mt-2 flex justify-center">
              <Stars value={Math.round(m.value || 0)} readonly size={14} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-6" style={cardStyle}>
        <h3 className="font-display font-bold text-lg text-primary mb-5">Recent Feedback</h3>
        <div className="space-y-3">
          {(recent?.feedback || []).map((f, i) => (
            <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(13,11,26,0.5)', border: '1px solid rgba(139,92,246,0.1)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                    {f.student?.name?.charAt(0) || 'S'}
                  </div>
                  <span className="text-sm font-semibold text-primary">{f.student?.name || 'Student'}</span>
                </div>
                <Stars value={f.overall} readonly size={14} />
              </div>
              {f.comment && <p className="text-sm text-muted ml-9">{f.comment}</p>}
            </div>
          ))}
          {!recent?.feedback?.length && <p className="text-muted text-sm text-center py-8">No feedback yet</p>}
        </div>
      </div>
    </motion.div>
  )
}
