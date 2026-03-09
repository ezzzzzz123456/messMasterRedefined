import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-app flex flex-col overflow-hidden relative">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full blur-[120px]" style={{ background: 'rgba(139,92,246,0.15)' }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[100px]" style={{ background: 'rgba(236,72,153,0.1)' }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full blur-[80px]" style={{ background: 'rgba(139,92,246,0.08)' }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
            <span className="text-white text-lg">✦</span>
          </div>
          <span className="font-display font-bold text-xl text-primary">MessMaster</span>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="text-sm font-medium text-muted hover:text-primary transition-colors border border-border px-4 py-2 rounded-lg hover:border-accent/50"
        >
          Log In
        </button>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center flex-1 px-8 py-16 max-w-7xl mx-auto w-full gap-16">
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="flex-1 max-w-xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent-bright text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            AI-Powered Mess Intelligence
          </div>

          <h1 className="font-display text-6xl lg:text-7xl font-bold leading-[1.05] mb-6">
            <span className="text-primary">Join the future of</span>
            <br />
            <span className="italic" style={{ color: '#a78bfa' }}>campus dining.</span>
          </h1>

          <p className="text-muted text-lg leading-relaxed mb-10 max-w-md">
            Streamlining meal management for thousands of students. Quick, digital, and delicious.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { title: 'Mess', login: '/login/mess', register: '/register/mess' },
              { title: 'Student', login: '/login/student', register: '/register/student' },
              { title: 'NGO', login: '/login/ngo', register: '/register/ngo' },
            ].map(card => (
              <div key={card.title} className="rounded-xl border border-border/50 p-3" style={{ background: 'rgba(13,11,26,0.5)' }}>
                <p className="text-sm font-semibold text-primary mb-2">{card.title}</p>
                <div className="flex gap-2">
                  <button onClick={() => navigate(card.login)} className="btn-accent text-white text-xs px-3 py-2 rounded-lg">Login</button>
                  <button onClick={() => navigate(card.register)} className="text-primary text-xs px-3 py-2 rounded-lg border border-border/60">Register</button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — decorative card stack */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex-1 max-w-md relative"
        >
          {/* Background card */}
          <div className="absolute -top-4 -left-4 w-full h-full rounded-3xl border border-accent/10 rotate-3"
            style={{ background: 'rgba(139,92,246,0.05)' }} />
          <div className="absolute -top-2 -left-2 w-full h-full rounded-3xl border border-accent/15 rotate-1"
            style={{ background: 'rgba(139,92,246,0.07)' }} />

          {/* Main card */}
          <div className="glass rounded-3xl p-8 relative">
            <div className="mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 animate-float"
                style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.4), rgba(236,72,153,0.3))' }}>
                <span className="text-3xl">🍽️</span>
              </div>
              <h3 className="font-display font-bold text-2xl text-primary mb-1">Create Account</h3>
              <p className="text-muted text-sm">Join MessMaster today.</p>
            </div>

            {/* Mock form */}
            <div className="space-y-3">
              {[
                { label: 'Full Name', placeholder: 'John Doe', icon: '👤' },
                { label: 'College Email', placeholder: 'name@college.edu', icon: '✉️' },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-xs text-muted font-medium block mb-1.5">{f.label}</label>
                  <div className="input-field w-full rounded-xl px-4 py-3 text-muted text-sm flex items-center gap-2">
                    <span>{f.icon}</span>
                    <span>{f.placeholder}</span>
                  </div>
                </div>
              ))}

              {/* Role toggle */}
              <div>
                <label className="text-xs text-muted font-medium block mb-1.5">Who are you?</label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl" style={{ background: 'rgba(13,11,26,0.8)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <div className="btn-accent text-white text-sm font-medium py-2.5 rounded-lg text-center cursor-pointer">Student</div>
                  <div className="text-muted text-sm font-medium py-2.5 rounded-lg text-center cursor-pointer hover:text-primary transition-colors">Staff</div>
                </div>
              </div>

              <button className="btn-accent w-full text-white font-semibold py-3.5 rounded-xl text-sm mt-2">
                Create Account
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-4 text-muted text-xs border-t border-border/30">
        © 2024 MessMaster Systems. All rights reserved. Designed for campus excellence.
      </div>
    </div>
  )
}
