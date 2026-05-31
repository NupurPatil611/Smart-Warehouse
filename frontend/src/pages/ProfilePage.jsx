import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { User, Shield, Save, Key, Check, AlertCircle, Lock } from 'lucide-react'

const ROLE = {
  super_admin: { label:'Super Admin', style:'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  admin:       { label:'Admin',       style:'text-cyan-400   bg-cyan-500/10   border-cyan-500/20' },
  staff:       { label:'Staff',       style:'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  buyer:       { label:'Buyer',       style:'text-amber-400  bg-amber-500/10  border-amber-500/20' },
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [tab, setTab]         = useState('profile')
  const [success, setSuccess] = useState('')
  const [error, setError]     = useState('')
  const [saving, setSaving]   = useState(false)
  const [name, setName]       = useState(user?.name || '')
  const [passForm, setPassForm] = useState({ new_password: '', confirm_password: '' })

  const showSuccess = (msg) => {
    setSuccess(msg); setError('')
    setTimeout(() => setSuccess(''), 3500)
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Name cannot be empty'); return }
    setSaving(true); setError('')
    try {
      await api.put(`/users/${user.id}`, { name: name.trim() })
      showSuccess('Profile updated successfully!')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile')
    } finally { setSaving(false) }
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    if (passForm.new_password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (passForm.new_password !== passForm.confirm_password) { setError('Passwords do not match'); return }
    setSaving(true); setError('')
    try {
      await api.put('/auth/change-password', { new_password: passForm.new_password })
      showSuccess('Password changed! Use new password next login.')
      setPassForm({ new_password: '', confirm_password: '' })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to change password')
    } finally { setSaving(false) }
  }

  const rc = ROLE[user?.role] || { label: user?.role, style: 'text-slate-400' }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white">Settings & Profile</h2>
        <p className="text-xs text-slate-500">Manage your account information</p>
      </div>

      <div className="glass-card p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-cyan-500/25 flex-shrink-0">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">{user?.name}</h3>
          <p className="text-sm text-slate-400">{user?.email}</p>
          <span className={`badge border mt-1.5 ${rc.style}`}>{rc.label}</span>
        </div>
      </div>

      <div className="flex gap-1 p-1 glass-card rounded-xl">
        {[
          { id:'profile',  label:'Profile Info',    icon: User },
          { id:'password', label:'Change Password', icon: Key },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id}
            onClick={() => { setTab(id); setError(''); setSuccess('') }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === id
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/15 text-cyan-400 border border-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2.5">
          <Check size={15} /> {success}
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2.5">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {tab === 'profile' && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-white mb-5">Personal Information</h3>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="input-field" placeholder="Your full name" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Email Address</label>
              <input value={user?.email} className="input-field opacity-50 cursor-not-allowed" disabled />
              <p className="text-[10px] text-slate-600 mt-1">Email cannot be changed. Contact Super Admin.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Role</label>
              <div className="input-field flex items-center gap-2 opacity-50 cursor-not-allowed">
                <Shield size={14} className="text-slate-500" />
                <span>{rc.label}</span>
                <Lock size={12} className="ml-auto text-slate-600" />
              </div>
              <p className="text-[10px] text-slate-600 mt-1">Role is assigned by administrators.</p>
            </div>
            <button type="submit" disabled={saving}
              className="btn-primary flex items-center gap-2 text-sm">
              <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {tab === 'password' && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-white mb-5">Change Password</h3>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">New Password</label>
              <input type="password" value={passForm.new_password}
                onChange={e => setPassForm(p => ({...p, new_password: e.target.value}))}
                className="input-field" placeholder="Min 6 characters" required minLength={6} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Confirm New Password</label>
              <input type="password" value={passForm.confirm_password}
                onChange={e => setPassForm(p => ({...p, confirm_password: e.target.value}))}
                className="input-field" placeholder="Repeat new password" required />
            </div>
            <button type="submit" disabled={saving}
              className="btn-primary flex items-center gap-2 text-sm">
              <Key size={14} /> {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      <div className="glass-card p-5">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">System Info</h3>
        {[
          { label:'User ID',  value:`#${user?.id}` },
          { label:'System',   value:'Smart Warehouse Management System' },
          { label:'Version',  value:'v1.0.0' },
          { label:'Role',     value: rc.label },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
            <span className="text-xs text-slate-500">{label}</span>
            <span className="text-xs text-slate-300 font-mono">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}