import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../api/axios'
import useAuthStore from '../store/useAuthStore'

export default function RegisterBio() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const { register, handleSubmit } = useForm()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register/bio', values)
      window.__accessToken = data.accessToken
      localStorage.setItem('refreshToken', data.refreshToken)
      setUser(data.user)
      toast.success('BioLoop account created')
      navigate('/bio/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl p-8 border border-border/50" style={{ background: 'rgba(19,16,42,0.9)' }}>
        <div className="mb-4">
          <Link to="/" className="text-xs text-accent-bright hover:text-accent-light">← Back to Home</Link>
        </div>
        <h1 className="font-display text-3xl font-bold text-primary mb-2">BioLoop Registration</h1>
        <p className="text-muted text-sm mb-7">Create a biogas marketplace account with a mappable plant location.</p>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <input {...register('organizationName', { required: true })} className="input-field rounded-xl px-4 py-3 text-sm w-full" placeholder="Bio plant / organization name" />
          <div className="space-y-2">
            <input {...register('location', { required: true })} className="input-field rounded-xl px-4 py-3 text-sm w-full" placeholder="Location / Address" />
            <p className="text-[11px] text-muted">Use a complete address so nearby waste listings can be filtered within 50 km.</p>
          </div>
          <input {...register('email', { required: true })} type="email" className="input-field rounded-xl px-4 py-3 text-sm w-full" placeholder="Contact Email" />
          <input {...register('password', { required: true, minLength: 6 })} type="password" className="input-field rounded-xl px-4 py-3 text-sm w-full" placeholder="Password" />
          <button type="submit" disabled={loading} className="btn-accent w-full text-white font-semibold py-3 rounded-xl text-sm">
            {loading ? 'Registering...' : 'Register BioLoop'}
          </button>
        </form>
      </div>
    </div>
  )
}
