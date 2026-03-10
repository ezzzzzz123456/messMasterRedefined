import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../api/axios'
import useAuthStore from '../store/useAuthStore'

export default function RegisterStudent() {
  const navigate = useNavigate()
  const { registerStudent } = useAuthStore()
  const { register, handleSubmit } = useForm()
  const [loading, setLoading] = useState(false)
  const [messes, setMesses] = useState([])

  useEffect(() => {
    api.get('/auth/register/messes')
      .then((res) => setMesses(res.data.messes || []))
      .catch(() => setMesses([]))
  }, [])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await registerStudent({
        name: data.name,
        email: data.email,
        password: data.password,
        rollNo: data.rollNo,
        year: Number(data.year),
        messId: data.messId,
      })
      toast.success('Registration successful')
      navigate('/student/feedback')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-3xl p-8 border border-border/50" style={{ background: 'rgba(19,16,42,0.9)' }}>
        <div className="mb-4">
          <Link to="/" className="text-xs text-accent-bright hover:text-accent-light">← Back to Home</Link>
        </div>
        <h1 className="font-display text-3xl font-bold text-primary mb-2">Student Registration</h1>
        <p className="text-muted text-sm mb-7">Create your account and connect to a mess</p>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs text-muted uppercase tracking-wider block mb-2">Name</label>
            <input {...register('name', { required: true })} className="input-field w-full rounded-xl px-4 py-3 text-primary text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-muted uppercase tracking-wider block mb-2">Email</label>
            <input {...register('email', { required: true })} type="email" className="input-field w-full rounded-xl px-4 py-3 text-primary text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-muted uppercase tracking-wider block mb-2">Password</label>
            <input {...register('password', { required: true, minLength: 6 })} type="password" className="input-field w-full rounded-xl px-4 py-3 text-primary text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider block mb-2">Roll Number</label>
            <input {...register('rollNo', { required: true })} className="input-field w-full rounded-xl px-4 py-3 text-primary text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider block mb-2">Year</label>
            <input {...register('year', { required: true, min: 1, max: 5 })} type="number" className="input-field w-full rounded-xl px-4 py-3 text-primary text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-muted uppercase tracking-wider block mb-2">Mess</label>
            <select {...register('messId', { required: true })} className="input-field w-full rounded-xl px-4 py-3 text-primary text-sm">
              <option value="">Select mess...</option>
              {messes.map(m => (
                <option key={m._id} value={m._id}>
                  {m.name}{m.location ? ` - ${m.location}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 pt-2">
            <button type="submit" disabled={loading} className="btn-accent w-full text-white font-semibold py-3.5 rounded-xl text-sm">
              {loading ? 'Registering...' : 'Register Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
