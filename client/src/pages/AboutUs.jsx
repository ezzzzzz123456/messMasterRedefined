import { Link } from 'react-router-dom'
import LogoLink from '../components/ui/LogoLink'

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-app text-primary">
      <header className="border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <LogoLink />
          <nav className="flex items-center gap-6 text-sm">
            <Link to="/" className="text-muted hover:text-primary">Home</Link>
            <Link to="/login/student" className="text-muted hover:text-primary">Student Portal</Link>
            <Link to="/review" className="text-muted hover:text-primary">Review</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-14">
        <h1 className="font-display text-4xl font-bold mb-4">About Us</h1>
        <p className="text-muted leading-relaxed">
          MessMaster helps campuses optimize dining operations, reduce waste, and improve community impact through data-driven workflows.
        </p>
      </main>
    </div>
  )
}
