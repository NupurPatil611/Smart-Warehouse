import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Warehouse, ArrowRight, Package, Boxes, BarChart3, Users } from 'lucide-react'

const FEATURES = [
  { icon: Package,  text: 'Real-time inventory tracking' },
  { icon: Boxes,    text: 'Smart bulk stock management' },
  { icon: BarChart3,text: 'Advanced analytics & reports' },
  { icon: Users,    text: 'Role-based access control' },
]

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex flex-col w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden p-12">
        {/* Glow blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.1) 1px,transparent 1px)', backgroundSize: '40px 40px' }}
        />

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-auto">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Warehouse size={20} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">SWMS v1.0</span>
          </div>

          {/* Illustration + text */}
          <div className="my-auto">
            {/* Simple SVG warehouse */}
            <div className="w-56 h-44 mx-auto mb-10 opacity-70">
              <svg viewBox="0 0 280 200" className="w-full h-full">
                <defs>
                  <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity=".8"/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity=".4"/>
                  </linearGradient>
                  <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity=".6"/>
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity=".3"/>
                  </linearGradient>
                </defs>
                {/* Floor */}
                <line x1="10" y1="180" x2="270" y2="180" stroke="rgba(6,182,212,.3)" strokeWidth="2"/>
                {/* Shelf uprights */}
                {[30,100,170,240].map((x,i)=><line key={i} x1={x} y1="30" x2={x} y2="180" stroke="rgba(6,182,212,.25)" strokeWidth="1.5"/>)}
                {/* Shelf rails */}
                {[60,100,140,180].map((y,i)=><line key={i} x1="10" y1={y} x2="270" y2={y} stroke="rgba(6,182,212,.2)" strokeWidth="1"/>)}
                {/* Boxes */}
                {[[35,65,50,30],[90,65,50,30],[145,65,50,30],[35,105,50,30],[90,105,30,30],[155,105,50,30],[35,145,60,30],[105,145,40,30],[155,145,35,30]].map(([x,y,w,h],i)=>(
                  <rect key={i} x={x} y={y} width={w} height={h} rx="3" fill={i%2===0?"url(#g2)":"url(#g1)"} stroke="rgba(6,182,212,.2)" strokeWidth=".5"/>
                ))}
              </svg>
            </div>

            <h1 className="text-4xl font-bold text-white mb-3 leading-tight">
              Smart Warehouse<br/>
              <span className="gradient-text">Management System</span>
            </h1>
            <p className="text-slate-400 text-sm mb-10 max-w-sm leading-relaxed">
              Enterprise-grade inventory control with real-time analytics, role-based access, and intelligent stock tracking.
            </p>

            <div className="space-y-3">
              {FEATURES.map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-400">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Icon size={14} className="text-cyan-400" />
                  </div>
                  {text}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-700 mt-auto">© 2024 Smart Warehouse Management System</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Warehouse size={20} className="text-white" />
            </div>
            <div>
              <p className="text-base font-bold text-white">Smart Warehouse</p>
              <p className="text-xs text-slate-500">Management System</p>
            </div>
          </div>

          <div className="glass-card p-8 shadow-xl shadow-cyan-500/5">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
              <p className="text-slate-400 text-sm">Sign in to your account</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-rose-400 rounded-full flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="admin@warehouse.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-field pr-12"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                  ) : (
                    <>Sign In <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
            </form>

            {/* Demo hint */}
            <div className="mt-6 pt-5 border-t border-white/5">
              <p className="text-xs text-slate-500 mb-2 font-medium">First time? Register a Super Admin:</p>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-400 space-y-1">
                <p>POST <span className="text-cyan-400 font-mono">http://localhost:8000/api/auth/register</span></p>
                <p className="text-slate-600">Send: name, email, password</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
