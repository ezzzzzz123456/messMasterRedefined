import { Link } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'

const getTarget = (user) => {
  if (!user) return '/'
  if (user.role === 'staff') return '/dashboard/overview'
  if (user.role === 'student') return '/student/feedback'
  if (user.role === 'ngo') return '/ngo/dashboard'
  return '/'
}

export default function LogoLink({ className = '', showText = true }) {
  const user = useAuthStore(s => s.user)
  const to = getTarget(user)

  return (
    <Link to={to} className={`flex items-center gap-3 ${className}`}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
        <span className="text-white text-lg">✦</span>
      </div>
      {showText && <span className="font-display font-bold text-xl text-primary">MessMaster</span>}
    </Link>
  )
}
