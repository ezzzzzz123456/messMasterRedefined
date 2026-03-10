import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import BioLoopLogo from '../components/ui/BioLoopLogo'

const NAV_ITEMS = [
  { label: 'Student Portal', to: '/login/student' },
  { label: 'BioLoop', to: '/bioloop', icon: true },
  { label: 'About Us', to: '/about-us' },
]

const PORTALS = [
  {
    title: 'Staff',
    description: 'Manage daily operations, student dining schedules, and real-time inventory levels through an intuitive dashboard.',
    to: '/login/mess',
    icon: '🧾',
    cta: 'Login / Register',
  },
  {
    title: 'NGO',
    description: 'Coordinate surplus food pickups seamlessly. Connect with dining halls to distribute fresh food to those in need.',
    to: '/login/ngo',
    icon: '🤝',
    cta: 'Login / Register',
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-app text-primary flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-20 left-1/3 w-[540px] h-[540px] rounded-full blur-[120px]" style={{ background: 'rgba(139,92,246,0.14)' }} />
        <div className="absolute -bottom-24 right-1/3 w-[420px] h-[420px] rounded-full blur-[110px]" style={{ background: 'rgba(236,72,153,0.08)' }} />
      </div>

      <header className="relative z-10 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
              <span className="text-white text-lg">✦</span>
            </div>
            <span className="font-display font-bold text-xl text-primary">MessMaster</span>
          </Link>
          <nav className="flex items-center gap-6">
            {NAV_ITEMS.map(item => (
              <Link key={item.label} to={item.to} className="text-sm text-muted hover:text-primary transition-colors flex items-center gap-2">
                {item.icon && <BioLoopLogo className="h-5 w-5 shrink-0" />}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-6 py-14">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center max-w-4xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 text-xs text-accent-bright mb-6"
            style={{ background: 'rgba(139,92,246,0.08)' }}>
            NEXT-GEN DINING PLATFORM
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight mb-5">
            Elevate Mess <span style={{ color: '#a78bfa' }}>Operations</span>
          </h1>
          <p className="text-lg text-muted max-w-3xl mx-auto">
            Streamlining campus food logistics with AI-driven demand forecasting, waste reduction, and community impact tracking.
          </p>
        </motion.section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PORTALS.map((portal, idx) => (
            <motion.article
              key={portal.title}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + idx * 0.1 }}
              className="rounded-3xl p-8 border border-border/50"
              style={{ background: 'linear-gradient(160deg, rgba(26,22,48,0.85), rgba(16,13,36,0.95))' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-5"
                style={{ background: 'rgba(139,92,246,0.18)' }}>
                {portal.icon}
              </div>
              <h2 className="font-display text-3xl font-bold mb-4">{portal.title}</h2>
              <p className="text-muted leading-relaxed min-h-[90px]">{portal.description}</p>
              <Link to={portal.to} className="btn-accent mt-6 inline-flex items-center justify-center w-full text-white font-semibold py-3 rounded-xl">
                {portal.cta} →
              </Link>
            </motion.article>
          ))}
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/40">
        <div className="max-w-6xl mx-auto px-6 py-4 text-xs text-muted text-center">
          © 2026 MessMaster Intelligence Platform. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
