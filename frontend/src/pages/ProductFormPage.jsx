import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../utils/api'
import { ArrowLeft, Save, Package, Loader } from 'lucide-react'

export default function ProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [categories, setCategories] = useState([])
  const [loading, setLoading]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [form, setForm] = useState({
    name: '', description: '', category_id: '', unit_price: '', is_active: true
  })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const catRes = await api.get('/categories')
        setCategories(catRes.data)
        if (isEdit) {
          const prodRes = await api.get(`/products/${id}`)
          const p = prodRes.data
          setForm({
            name: p.name,
            description: p.description || '',
            category_id: String(p.category_id),
            unit_price: String(p.unit_price),
            is_active: p.is_active,
          })
        }
      } catch { setError('Failed to load data') }
      finally { setLoading(false) }
    }
    load()
  }, [id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.category_id) { setError('Please select a category'); return }
    setError('')
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        category_id: parseInt(form.category_id),
        unit_price: parseFloat(form.unit_price) || 0,
        is_active: form.is_active,
      }
      if (isEdit) await api.put(`/products/${id}`, payload)
      else        await api.post('/products', payload)
      navigate('/products')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save product')
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back + title */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/products')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-all">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <p className="text-xs text-slate-500">{isEdit ? 'Update product information' : 'Create a new warehouse product'}</p>
        </div>
      </div>

      <div className="glass-card p-6">
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Product Name *</label>
            <input name="name" value={form.name} onChange={handleChange}
              className="input-field" placeholder="e.g., Wireless Mechanical Keyboard" required />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              rows={3} className="input-field resize-none" placeholder="Optional description..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Category *</label>
              <select name="category_id" value={form.category_id} onChange={handleChange} className="input-field" required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
              </select>
              {categories.length === 0 && (
                <p className="text-xs text-amber-400 mt-1.5">
                  No categories yet.{' '}
                  <span className="underline cursor-pointer" onClick={() => navigate('/categories')}>Create one first</span>
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Unit Price ($)</label>
              <input name="unit_price" type="number" step="0.01" min="0"
                value={form.unit_price} onChange={handleChange}
                className="input-field" placeholder="0.00" />
            </div>
          </div>

          {/* Auto-code info (new only) */}
          {!isEdit && (
            <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/15">
              <div className="flex items-start gap-2.5">
                <Package size={14} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-cyan-300 mb-0.5">Auto-Generated Codes</p>
                  <p className="text-xs text-slate-400">
                    A unique product code (e.g. <span className="font-mono text-cyan-400">ELEC-KEY-001</span>) and
                    inventory ID will be auto-generated from the category + name.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Active toggle (edit only) */}
          {isEdit && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/60 border border-white/5">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div className="relative" onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}>
                  <div className={`w-10 h-5 rounded-full transition-colors ${form.is_active ? 'bg-cyan-500' : 'bg-slate-700'}`} />
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">Active</p>
                  <p className="text-xs text-slate-500">{form.is_active ? 'Product is visible and active' : 'Product is inactive'}</p>
                </div>
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/products')} className="btn-secondary flex-1 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
              {saving ? <><Loader size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> {isEdit ? 'Update' : 'Create Product'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
