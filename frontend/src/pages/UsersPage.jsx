import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { UserPlus, Trash2, ToggleLeft, ToggleRight, X, Users } from 'lucide-react'

const ROLE = {
  super_admin: { label:'Super Admin', style:'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  admin:       { label:'Admin',       style:'text-cyan-400   bg-cyan-500/10   border-cyan-500/20' },
  staff:       { label:'Staff',       style:'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  buyer:       { label:'Buyer',       style:'text-amber-400  bg-amber-500/10  border-amber-500/20' },
}

function AddUserModal({ onClose, onSave, currentRole }) {
  const [form, setForm]   = useState({ name:'', email:'', password:'', role:'staff' })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const roles = currentRole === 'super_admin'
    ? ['super_admin','admin','staff','buyer']
    : ['staff','buyer']

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try { const res = await api.post('/users', form); onSave(res.data) }
    catch (err) { setError(err.response?.data?.detail || 'Failed to create user') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white">Create New User</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"><X size={16} /></button>
        </div>
        {error && <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label:'Full Name', name:'name',  type:'text',     placeholder:'John Doe' },
            { label:'Email',     name:'email', type:'email',    placeholder:'john@warehouse.com' },
            { label:'Password',  name:'password', type:'password', placeholder:'Min 8 chars' },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name}>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>
              <input type={type} value={form[name]}
                onChange={e => setForm(p => ({...p, [name]:e.target.value}))}
                className="input-field" placeholder={placeholder} required
                minLength={name === 'password' ? 8 : undefined} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Role</label>
            <select value={form.role} onChange={e => setForm(p=>({...p, role:e.target.value}))} className="input-field">
              {roles.map(r => <option key={r} value={r}>{ROLE[r]?.label}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">
              {saving ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const { user: me, isSuperAdmin } = useAuth()

  useEffect(() => {
    api.get('/users').then(r => setUsers(r.data)).finally(() => setLoading(false))
  }, [])

  const toggleActive = async (u) => {
    try {
      const res = await api.put(`/users/${u.id}`, { is_active: !u.is_active })
      setUsers(prev => prev.map(x => x.id === u.id ? res.data : x))
    } catch (e) { alert(e.response?.data?.detail || 'Failed') }
  }

  const deleteUser = async (u) => {
    if (!window.confirm(`Delete user "${u.name}"? This is permanent.`)) return
    try {
      await api.delete(`/users/${u.id}`)
      setUsers(prev => prev.filter(x => x.id !== u.id))
    } catch (e) { alert(e.response?.data?.detail || 'Failed') }
  }

  const roleCounts = users.reduce((acc, u) => ({ ...acc, [u.role]: (acc[u.role]||0)+1 }), {})

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">User Management</h2>
          <p className="text-xs text-slate-500">{users.length} registered users</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <UserPlus size={15} /> Add User
        </button>
      </div>

      {/* Role counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(ROLE).map(([role, { label, style }]) => (
          <div key={role} className="glass-card p-4">
            <p className="text-2xl font-bold text-white">{roleCounts[role] || 0}</p>
            <span className={`badge border text-xs mt-1 ${style}`}>{label}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['User','Role','Status','Joined','Actions'].map(h => (
                <th key={h} className={`px-4 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest ${h==='Actions'?'text-right':'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(4)].map((_,i) => (
                <tr key={i} className="border-b border-white/5">
                  {[...Array(5)].map((_,j) => <td key={j} className="px-4 py-3.5"><div className="h-4 bg-slate-800 rounded animate-pulse" /></td>)}
                </tr>
              ))
            ) : users.map(u => {
              const rc = ROLE[u.role] || { label: u.role, style: 'text-slate-400' }
              const isSelf = u.id === me?.id
              return (
                <tr key={u.id} className={`table-row ${isSelf ? 'bg-cyan-500/[0.02]' : ''}`}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-sm font-bold text-slate-300">
                        {u.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-200">
                          {u.name} {isSelf && <span className="text-[10px] text-cyan-400">(you)</span>}
                        </p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`badge border ${rc.style}`}>{rc.label}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`badge border ${u.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">
                    {new Date(u.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {!isSelf && (
                        <button onClick={() => toggleActive(u)}
                          className={`p-1.5 rounded-lg transition-all ${u.is_active ? 'text-slate-500 hover:text-amber-400 hover:bg-amber-500/10' : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10'}`}
                          title={u.is_active ? 'Deactivate' : 'Activate'}>
                          {u.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                      )}
                      {!isSelf && isSuperAdmin() && (
                        <button onClick={() => deleteUser(u)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <AddUserModal
          onClose={() => setShowModal(false)}
          onSave={(u) => { setUsers(prev => [...prev, u]); setShowModal(false) }}
          currentRole={me?.role}
        />
      )}
    </div>
  )
}
