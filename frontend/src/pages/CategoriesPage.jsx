import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { Tag, Plus, Edit2, Trash2, X, Package } from 'lucide-react'

const CARD_COLORS = [
  'border-cyan-500/20   bg-gradient-to-br from-cyan-500/10   to-cyan-500/5',
  'border-blue-500/20   bg-gradient-to-br from-blue-500/10   to-blue-500/5',
  'border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-violet-500/5',
  'border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5',
  'border-amber-500/20  bg-gradient-to-br from-amber-500/10  to-amber-500/5',
  'border-rose-500/20   bg-gradient-to-br from-rose-500/10   to-rose-500/5',
]
const CODE_COLORS = ['text-cyan-400','text-blue-400','text-violet-400','text-emerald-400','text-amber-400','text-rose-400']

function Modal({ cat, onClose, onSave }) {
  const [form, setForm] = useState({ name: cat?.name || '', code: cat?.code || '', description: cat?.description || '' })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const res = cat
        ? await api.put(`/categories/${cat.id}`, form)
        : await api.post('/categories', form)
      onSave(res.data)
    } catch (err) { setError(err.response?.data?.detail || 'Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white">{cat ? 'Edit Category' : 'New Category'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"><X size={16} /></button>
        </div>
        {error && <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Name *</label>
            <input value={form.name} onChange={e => setForm(p=>({...p, name:e.target.value}))}
              className="input-field" placeholder="e.g., Electronics" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Code * (max 6 chars)</label>
            <input value={form.code}
              onChange={e => setForm(p=>({...p, code:e.target.value.toUpperCase().replace(/[^A-Z]/g,'').slice(0,6)}))}
              className="input-field font-mono" placeholder="ELEC" required maxLength={6} />
            <p className="text-[10px] text-slate-600 mt-1">Used for codes like: ELEC-KEY-001</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea value={form.description} onChange={e => setForm(p=>({...p, description:e.target.value}))}
              rows={2} className="input-field resize-none" placeholder="Optional..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">
              {saving ? 'Saving...' : cat ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(null) // null | 'new' | category obj
  const { canManage, isSuperAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).finally(() => setLoading(false))
  }, [])

  const handleSave = (saved) => {
    setCategories(prev => {
      const exists = prev.find(c => c.id === saved.id)
      return exists ? prev.map(c => c.id === saved.id ? saved : c) : [...prev, saved]
    })
    setModal(null)
  }

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete "${cat.name}"? Products in this category must be moved first.`)) return
    try {
      await api.delete(`/categories/${cat.id}`)
      setCategories(prev => prev.filter(c => c.id !== cat.id))
    } catch (e) { alert(e.response?.data?.detail || 'Delete failed') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Categories</h2>
          <p className="text-xs text-slate-500">{categories.length} categories</p>
        </div>
        {canManage() && (
          <button onClick={() => setModal('new')} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Add Category
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_,i) => <div key={i} className="glass-card h-40 animate-pulse bg-slate-800/50" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
            <Tag size={24} className="text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium mb-1">No categories yet</p>
          <p className="text-slate-600 text-sm mb-4">Categories auto-generate product codes like ELEC-KEY-001</p>
          {canManage() && (
            <button onClick={() => setModal('new')} className="btn-primary text-sm mx-auto inline-flex items-center gap-2">
              <Plus size={15} /> Create First Category
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <div key={cat.id} className={`glass-card p-5 border ${CARD_COLORS[i % CARD_COLORS.length]} hover:scale-[1.01] transition-all duration-200`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-slate-900/60 flex items-center justify-center font-mono font-bold text-xs ${CODE_COLORS[i % CODE_COLORS.length]}`}>
                  {cat.code}
                </div>
                {canManage() && (
                  <div className="flex gap-1">
                    <button onClick={() => setModal(cat)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-all"><Edit2 size={13} /></button>
                    {isSuperAdmin() && (
                      <button onClick={() => handleDelete(cat)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"><Trash2 size={13} /></button>
                    )}
                  </div>
                )}
              </div>
              <h3 className="text-base font-bold text-white mb-1">{cat.name}</h3>
              {cat.description && <p className="text-xs text-slate-500 leading-relaxed">{cat.description}</p>}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
                <Package size={11} className="text-slate-700" />
                <span className="text-[10px] text-slate-600">
                  Code prefix: <span className="font-mono text-slate-400">{cat.code}-XXX-001</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-700 mt-1">{new Date(cat.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {modal && <Modal cat={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
    </div>
  )
}
