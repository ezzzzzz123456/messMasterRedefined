import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from '../store/useAuthStore'

import Landing from '../pages/Landing'
import BioLoop from '../pages/BioLoop'
import Review from '../pages/Review'
import AboutUs from '../pages/AboutUs'
import LoginSelect from '../pages/LoginSelect'
import StaffLogin from '../pages/StaffLogin'
import StudentLogin from '../pages/StudentLogin'
import BioLogin from '../pages/BioLogin'
import RegisterSelect from '../pages/RegisterSelect'
import RegisterStudent from '../pages/RegisterStudent'
import RegisterMess from '../pages/RegisterMess'
import RegisterNGO from '../pages/RegisterNGO'
import RegisterBio from '../pages/RegisterBio'
import SetupWizard from '../pages/SetupWizard'
import DashboardLayout from '../components/layout/DashboardLayout'
import Overview from '../pages/dashboard/Overview'
import MenuAnalysis from '../pages/dashboard/MenuAnalysis'
import Oracle from '../pages/dashboard/Oracle'
import LogWaste from '../pages/dashboard/LogWaste'
import FeedbackPage from '../pages/dashboard/FeedbackPage'
import InventoryPage from '../pages/dashboard/InventoryPage'
import SetupPage from '../pages/dashboard/SetupPage'
import FoodListings from '../pages/dashboard/FoodListings'
import RequestsPage from '../pages/dashboard/RequestsPage'
import OrdersPage from '../pages/dashboard/OrdersPage'
import BioLoopWaste from '../pages/dashboard/BioLoopWaste'
import BioLoopRequestsPage from '../pages/dashboard/BioLoopRequestsPage'
import BioLoopOrdersPage from '../pages/dashboard/BioLoopOrdersPage'
import StudentPortal from '../pages/student/StudentPortal'
import NGOLogin from '../pages/NGOLogin'
import NGODashboard from '../pages/ngo/NGODashboard'
import MessDetail from '../pages/ngo/MessDetail'
import BioDashboard from '../pages/bio/BioDashboard'
import BioListingDetail from '../pages/bio/BioListingDetail'

const ProtectedRoute = ({ children, role }) => {
  const { user, isLoading } = useAuthStore()
  if (isLoading) return (
    <div className="min-h-screen bg-app flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
          <span className="text-white text-xl">✦</span>
        </div>
        <p className="font-display text-xl text-primary animate-pulse">MessMaster</p>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/" replace />
  if (role && user.role !== role) {
    if (user.role === 'staff') return <Navigate to="/dashboard/overview" replace />
    if (user.role === 'ngo') return <Navigate to="/ngo/dashboard" replace />
    if (user.role === 'bio') return <Navigate to="/bio/dashboard" replace />
    return <Navigate to="/student/feedback" replace />
  }
  return children
}

export default function AppRouter() {
  const init = useAuthStore(s => s.init)
  useEffect(() => { init() }, [init])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/bioloop" element={<BioLoop />} />
        <Route path="/review" element={<Review />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/student-portal" element={<Navigate to="/login/student" replace />} />
        <Route path="/login" element={<LoginSelect />} />
        <Route path="/login/mess" element={<StaffLogin />} />
        <Route path="/login/staff" element={<StaffLogin />} />
        <Route path="/login/student" element={<StudentLogin />} />
        <Route path="/login/ngo" element={<NGOLogin />} />
        <Route path="/login/bio" element={<BioLogin />} />
        <Route path="/mess/login" element={<Navigate to="/login/mess" replace />} />
        <Route path="/staff/login" element={<Navigate to="/login/staff" replace />} />
        <Route path="/student/login" element={<Navigate to="/login/student" replace />} />
        <Route path="/register" element={<RegisterSelect />} />
        <Route path="/register/student" element={<RegisterStudent />} />
        <Route path="/register/mess" element={<RegisterMess />} />
        <Route path="/register/ngo" element={<RegisterNGO />} />
        <Route path="/register/bio" element={<RegisterBio />} />
        <Route path="/setup" element={
          <ProtectedRoute role="staff"><SetupWizard /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute role="staff"><DashboardLayout /></ProtectedRoute>
        }>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="menu-analysis" element={<MenuAnalysis />} />
          <Route path="oracle" element={<Oracle />} />
          <Route path="log-waste" element={<LogWaste />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="listings" element={<FoodListings />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="bioloop" element={<BioLoopWaste />} />
          <Route path="bioloop-requests" element={<BioLoopRequestsPage />} />
          <Route path="bioloop-orders" element={<BioLoopOrdersPage />} />
          <Route path="setup" element={<SetupPage />} />
        </Route>
        <Route path="/student/feedback" element={
          <ProtectedRoute role="student"><StudentPortal /></ProtectedRoute>
        } />
        <Route path="/ngo/dashboard" element={
          <ProtectedRoute role="ngo"><NGODashboard /></ProtectedRoute>
        } />
        <Route path="/ngo/mess/:listingId" element={
          <ProtectedRoute role="ngo"><MessDetail /></ProtectedRoute>
        } />
        <Route path="/bio/dashboard" element={
          <ProtectedRoute role="bio"><BioDashboard /></ProtectedRoute>
        } />
        <Route path="/bio/listing/:listingId" element={
          <ProtectedRoute role="bio"><BioListingDetail /></ProtectedRoute>
        } />
        <Route path="/student" element={<Navigate to="/student/feedback" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
