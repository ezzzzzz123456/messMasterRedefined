import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import api from '../../api/axios'

export default function CookReviews() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [expanded, setExpanded] = useState(null)
  const cardStyle = { background: 'linear-gradient(135deg, rgba(26,22,48,0.9), rgba(19,16,42,0.95))', border: '1px solid rgba(139,92,246,0.15)' }

  const { data, isLoading } = useQuery({
    queryKey: ['cook-reviews', date],
    queryFn: () => api.get(`/cook-reviews/${date}`).then(r => r.data),
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Cook Reviews</h1>
          <p className="text-muted text-sm mt-1">AI-generated daily performance reviews</p>
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="input-field px-4 py-2.5 rounded-xl text-sm text-primary" />
      </div>

      {isLoading && <div className="text-center py-12 text-muted animate-pulse">Generating AI reviews...</div>}

      <div className="space-y-4">
        {(data || []).map((review, i) => (
          <div key={i} className="rounded-2xl overflow-hidden" style={cardStyle}>
            <button onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                  {review.staffId?.name?.charAt(0) || 'C'}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-primary">{review.staffId?.name || 'Staff Member'}</p>
                  <p className="text-xs text-muted">{review.staffId?.role || 'Cook'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-display text-2xl font-bold text-accent-bright">{review.compositeScore || 0}/10</p>
                  <p className="text-xs text-muted">Performance</p>
                </div>
                <span className="text-muted text-lg">{expanded === i ? '▲' : '▼'}</span>
              </div>
            </button>
            {expanded === i && (
              <div className="px-5 pb-5 border-t border-border/30">
                <div className="pt-4 grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Waste Rate', value: `${Math.round((review.wasteRatio || 0) * 100)}%` },
                    { label: 'Feedback', value: `${(review.avgRating || 0).toFixed(1)}/5` },
                    { label: 'Grade', value: review.grade || 'B' },
                  ].map(s => (
                    <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: 'rgba(13,11,26,0.5)', border: '1px solid rgba(139,92,246,0.1)' }}>
                      <p className="font-display text-lg font-bold text-accent-bright">{s.value}</p>
                      <p className="text-xs text-muted">{s.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted leading-relaxed p-4 rounded-xl" style={{ background: 'rgba(13,11,26,0.5)', border: '1px solid rgba(139,92,246,0.08)' }}>
                  {review.aiReviewText || 'AI review generated based on waste patterns, student feedback, and preparation consistency.'}
                </p>
              </div>
            )}
          </div>
        ))}
        {!isLoading && !(data || []).length && (
          <div className="text-center py-12 text-muted">No reviews for this date</div>
        )}
      </div>
    </motion.div>
  )
}
