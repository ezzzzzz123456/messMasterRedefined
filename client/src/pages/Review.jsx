import { Link } from 'react-router-dom'
import LogoLink from '../components/ui/LogoLink'

export default function Review() {
  return (
    <div className="min-h-screen bg-app text-primary">
      <header className="border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <LogoLink />
          <nav className="flex items-center gap-6 text-sm">
            <Link to="/" className="text-muted hover:text-primary">Home</Link>
            <Link to="/login/student" className="text-muted hover:text-primary">Student Portal</Link>
            <Link to="/about-us" className="text-muted hover:text-primary">About Us</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-14">
        <h1 className="font-display text-4xl font-bold mb-4">Review</h1>
        <p className="text-muted leading-relaxed">
          Student and operational reviews are available after login inside the respective portals.
        </p>
      </main>
    </div>
  )
}
