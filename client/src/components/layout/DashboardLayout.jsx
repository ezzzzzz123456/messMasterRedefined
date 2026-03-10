import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard, ChefHat, Brain, ClipboardList,
  MessageSquare, Package, Settings, LogOut, Menu, Bell, HandCoins, Inbox, ShoppingBag, Recycle
} from 'lucide-react'
import useAuthStore from '../../store/useAuthStore'
import api from '../../api/axios'
import LogoLink from '../ui/LogoLink'

const NAV = [
  { to: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
  { to: 'menu-analysis', icon: ChefHat, label: 'Menu Analysis' },
  { to: 'oracle', icon: Brain, label: 'Oracle' },
  { to: 'log-waste', icon: ClipboardList, label: 'Waste Log' },
  { to: 'feedback', icon: MessageSquare, label: 'Feedback' },
  { to: 'inventory', icon: Package, label: 'Inventory' },
  { to: 'listings', icon: HandCoins, label: 'Food Listings' },
  { to: 'requests', icon: Inbox, label: 'Requests' },
  { to: 'orders', icon: ShoppingBag, label: 'Orders' },
  { to: 'bioloop', icon: Recycle, label: 'BioLoop Waste' },
  { to: 'bioloop-requests', icon: Inbox, label: 'BioLoop Requests' },
  { to: 'bioloop-orders', icon: ShoppingBag, label: 'BioLoop Orders' },
  { to: 'setup', icon: Settings, label: 'Settings' },
]

export default function DashboardLayout() {
  const { user, logout, sidebarOpen, toggleSidebar } = useAuthStore()
  const navigate = useNavigate()
  const { data: notif } = useQuery({
    queryKey: ['mess-notification-count'],
    queryFn: () => api.get('/requests/mess/notifications/count').then(r => r.data),
    refetchInterval: 5000,
  })

  const handleLogout = async () => { await logout(); navigate('/') }

  return (
    <div className="flex h-screen bg-app overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 68 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex flex-col shrink-0 overflow-hidden border-r border-border/50 z-20"
        style={{ background: 'linear-gradient(180deg, #13102a 0%, #0d0b1a 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-border/50 shrink-0">
          <LogoLink className="min-w-0 flex-1" showText={sidebarOpen} />
          <button onClick={toggleSidebar}
            className="ml-auto text-muted hover:text-primary p-1 transition-colors shrink-0">
            <Menu size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-5 px-3 overflow-y-auto space-y-1">
          {sidebarOpen && (
            <p className="text-xs font-semibold text-muted uppercase tracking-wider px-3 mb-3">Main Menu</p>
          )}
          {NAV.slice(0, 4).map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={`/dashboard/${to}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  isActive ? 'nav-active' : 'text-muted hover:text-primary hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              {sidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{label}</motion.span>}
            </NavLink>
          ))}

          {sidebarOpen && (
            <p className="text-xs font-semibold text-muted uppercase tracking-wider px-3 mt-5 mb-3">Management</p>
          )}
          {!sidebarOpen && <div className="my-3 border-t border-border/30" />}
          {NAV.slice(4).map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={`/dashboard/${to}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  isActive ? 'nav-active' : 'text-muted hover:text-primary hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              {sidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{label}</motion.span>}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-border/50 shrink-0">
          {sidebarOpen && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl" style={{ background: 'rgba(139,92,246,0.08)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                {user?.name?.charAt(0) || 'S'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-primary truncate">{user?.name}</p>
                <p className="text-xs text-muted">Mess Administrator</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-muted hover:text-red hover:bg-red/5 text-sm transition-all">
            <LogOut size={18} className="shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border/50 flex items-center justify-between px-6 shrink-0"
          style={{ background: 'rgba(19,16,42,0.8)', backdropFilter: 'blur(10px)' }}>
          <div>
            <h2 className="text-base font-semibold text-primary">Operations Overview</h2>
            <p className="text-xs text-muted">Real-time insights for hostel mess management.</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard/requests')}
              className="relative p-2 rounded-xl text-muted hover:text-primary hover:bg-white/5 transition-colors border border-border/50"
            >
              <Bell size={18} />
              {(notif?.count || 0) > 0 && <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 bg-red rounded-full text-[10px] leading-4 text-white text-center">{notif.count}</span>}
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-border/50">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-primary">{user?.name}</p>
                <p className="text-xs text-muted">Mess Administrator</p>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                {user?.name?.charAt(0) || 'S'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
