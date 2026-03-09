import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../api/axios'
import useAuthStore from '../store/useAuthStore'

export default function RegisterNGO() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const { register, handleSubmit } = useForm()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register/ngo', values)
      window.__accessToken = data.accessToken
      localStorage.setItem('refreshToken', data.refreshToken)
      setUser(data.user)
      toast.success('NGO registered')
      navigate('/ngo/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl p-8 border border-border/50" style={{ background: 'rgba(19,16,42,0.9)' }}>
        <h1 className="font-display text-3xl font-bold text-primary mb-2">NGO Registration</h1>
        <p className="text-muted text-sm mb-7">Create NGO account</p>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <input {...register('ngoName', { required: true })} className="input-field rounded-xl px-4 py-3 text-sm w-full" placeholder="NGO Name" />
          <input {...register('location', { required: true })} className="input-field rounded-xl px-4 py-3 text-sm w-full" placeholder="Location" />
          <input {...register('email', { required: true })} type="email" className="input-field rounded-xl px-4 py-3 text-sm w-full" placeholder="Contact Email" />
          <input {...register('password', { required: true, minLength: 6 })} type="password" className="input-field rounded-xl px-4 py-3 text-sm w-full" placeholder="Password" />
          <button type="submit" disabled={loading} className="btn-accent w-full text-white font-semibold py-3 rounded-xl text-sm">
            {loading ? 'Registering...' : 'Register NGO'}
          </button>
        </form>
      </div>
    </div>
  )
}
