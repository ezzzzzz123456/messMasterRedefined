import { Link } from 'react-router-dom'

export default function LoginSelect() {
  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-3xl p-8 border border-border/50" style={{ background: 'rgba(19,16,42,0.9)' }}>
        <h1 className="font-display text-3xl font-bold text-primary mb-2">Login</h1>
        <p className="text-muted text-sm mb-8">Choose your role to continue</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/login/mess" className="rounded-2xl p-6 border border-border/50 hover:border-accent/50 transition-colors">
            <p className="text-lg font-semibold text-primary mb-1">Mess Login</p>
            <p className="text-sm text-muted">Dashboard, analytics, operations</p>
          </Link>
          <Link to="/login/student" className="rounded-2xl p-6 border border-border/50 hover:border-accent/50 transition-colors">
            <p className="text-lg font-semibold text-primary mb-1">Student Login</p>
            <p className="text-sm text-muted">Submit feedback and ratings</p>
          </Link>
          <Link to="/login/ngo" className="rounded-2xl p-6 border border-border/50 hover:border-accent/50 transition-colors">
            <p className="text-lg font-semibold text-primary mb-1">NGO Login</p>
            <p className="text-sm text-muted">Request excess food listings</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
