import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import BottomNav from '../components/layout/BottomNav'
import { useAuthStore } from '../store/useAuthStore'

export default function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuthStore()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Please fill all required fields')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    const result = await signup({
      name: form.name,
      email: form.email,
      password: form.password,
    })

    setLoading(false)

    if (!result.success) {
      setError(result.message || 'Signup failed')
      return
    }

    if (result.user?.role === 'ADMIN') {
      navigate('/admin', { replace: true })
      return
    }

    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-md mx-auto w-full px-4 py-10 pb-24 md:pb-10">
        <div className="card p-6 md:p-8">
          <div className="mb-6 text-center">
            <p className="text-sm text-primary font-semibold mb-2">Get started</p>
            <h1 className="font-display text-3xl font-bold text-ink mb-2">
              Create your account
            </h1>
            <p className="text-sm text-ink-muted">
              Save your trips and personalise your Jaipur planning experience.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                className="input"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Your full name"
              />
            </div>

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
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                className="input"
                value={form.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="Re-enter password"
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
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-5 text-sm text-ink-muted text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Login
            </Link>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}