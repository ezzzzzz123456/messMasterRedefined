import { Link } from 'react-router-dom'

export default function RegisterSelect() {
  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-3xl p-8 border border-border/50" style={{ background: 'rgba(19,16,42,0.9)' }}>
        <h1 className="font-display text-3xl font-bold text-primary mb-2">Register</h1>
        <p className="text-muted text-sm mb-8">Select registration type</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/register/student" className="rounded-2xl p-6 border border-border/50 hover:border-accent/50 transition-colors">
            <p className="text-lg font-semibold text-primary mb-1">Student Register</p>
            <p className="text-sm text-muted">Join existing mess and submit feedback</p>
          </Link>
          <Link to="/register/mess" className="rounded-2xl p-6 border border-border/50 hover:border-accent/50 transition-colors">
            <p className="text-lg font-semibold text-primary mb-1">Mess Register</p>
            <p className="text-sm text-muted">Create mess + admin + operational setup</p>
          </Link>
          <Link to="/register/ngo" className="rounded-2xl p-6 border border-border/50 hover:border-accent/50 transition-colors">
            <p className="text-lg font-semibold text-primary mb-1">NGO Register</p>
            <p className="text-sm text-muted">Create NGO account for food requests</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
