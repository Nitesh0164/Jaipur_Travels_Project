import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import BottomNav from '../components/layout/BottomNav'
import { useAuthStore } from '../store/useAuthStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuthStore()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || '/'

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.email.trim() || !form.password.trim()) {
      setError('Please enter email and password')
      return
    }

    setLoading(true)

    await new Promise((r) => setTimeout(r, 300))

    const result = login({
      email: form.email,
      password: form.password,
    })

    setLoading(false)

    if (!result.success) {
      setError(result.message || 'Login failed')
      return
    }

    if (result.user.role === 'ADMIN') {
      navigate('/admin', { replace: true })
      return
    }

    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-md mx-auto w-full px-4 py-10 pb-24 md:pb-10">
        <div className="card p-6 md:p-8">
          <div className="mb-6 text-center">
            <p className="text-sm text-primary font-semibold mb-2">Welcome back</p>
            <h1 className="font-display text-3xl font-bold text-ink mb-2">
              Login to Complete Jaipur
            </h1>
            <p className="text-sm text-ink-muted">
              Access your trips, saved plans, and admin dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Email
              </label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Password
              </label>
              <input
                type="password"
                className="input"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Enter password"
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-5 text-sm text-ink-muted text-center">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Create one
            </Link>
          </div>

          <div className="mt-6 rounded-2xl bg-primary-lighter p-4 text-xs text-ink-muted">
            <p className="font-semibold text-ink mb-1">Demo admin login</p>
            <p>Email: admin@jaipur.com</p>
            <p>Password: admin123</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}