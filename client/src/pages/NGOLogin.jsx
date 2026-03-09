import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import useAuthStore from '../store/useAuthStore'

export default function NGOLogin() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { register, handleSubmit } = useForm()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      await login(values.email, values.password)
      navigate('/ngo/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl p-8 border border-border/50" style={{ background: 'rgba(19,16,42,0.9)' }}>
        <h1 className="font-display text-3xl font-bold text-primary mb-2">NGO Login</h1>
        <p className="text-muted text-sm mb-7">Access food listings and requests</p>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <input {...register('email', { required: true })} type="email" className="input-field rounded-xl px-4 py-3 text-sm w-full" placeholder="ngo@email.org" />
          <input {...register('password', { required: true })} type="password" className="input-field rounded-xl px-4 py-3 text-sm w-full" placeholder="Password" />
          <button type="submit" disabled={loading} className="btn-accent w-full text-white font-semibold py-3 rounded-xl text-sm">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-xs text-muted mt-4">No NGO account? <Link className="text-accent-bright" to="/register/ngo">Register NGO</Link></p>
      </div>
    </div>
  )
}
