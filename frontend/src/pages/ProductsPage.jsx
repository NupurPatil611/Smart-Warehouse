import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { Plus, Search, Edit2, Trash2, Package, RefreshCw, Filter } from 'lucide-react'

export default function ProductsPage() {
  const [products, setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch]       = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [loading, setLoading]     = useState(true)
  const [deleting, setDeleting]   = useState(null)
  const { canManage, isSuperAdmin } = useAuth()
  const navigate = useNavigate()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search)    params.search      = search
      if (catFilter) params.category_id = catFilter
      const [prodRes, catRes] = await Promise.all([
        api.get('/products', { params }),
        api.get('/categories'),
      ])
      setProducts(prodRes.data)
      setCategories(catRes.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [search, catFilter])

  useEffect(() => { fetchData() }, [])

  const handleSearch = (e) => { e.preventDefault(); fetchData() }

  const handleReset = () => { setSearch(''); setCatFilter(''); setTimeout(fetchData, 100) }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      await api.delete(`/products/${id}`)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to delete')
    } finally { setDeleting(null) }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Products</h2>
          <p className="text-xs text-slate-500">{products.length} items found</p>
        </div>
        {canManage() && (
          <button onClick={() => navigate('/products/new')} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Add Product
          </button>
        )}
      </div>

      {/* Search & filter bar */}
      <div className="glass-card p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or product code..."
              className="input-field pl-10"
            />
          </div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="input-field sm:w-44">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button type="submit" className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap">
            <Filter size={14} /> Search
          </button>
          <button type="button" onClick={handleReset} className="btn-secondary p-2.5" title="Reset">
            <RefreshCw size={14} />
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['#','Product Code','Name','Category','Price','Status', canManage() && 'Actions'].filter(Boolean).map(h => (
                  <th key={h} className={`px-4 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest ${h==='Actions'?'text-right':'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_,i) => (
                  <tr key={i} className="border-b border-white/5">
                    {[...Array(canManage() ? 7 : 6)].map((_,j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-4 bg-slate-800 rounded animate-pulse" style={{width:`${50+Math.random()*40}%`}} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={canManage() ? 7 : 6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                        <Package size={20} className="text-slate-600" />
                      </div>
                      <p className="text-slate-400 text-sm font-medium">No products found</p>
                      <p className="text-slate-600 text-xs">{search ? 'Try a different search' : canManage() ? 'Click "Add Product" to get started' : 'No products added yet'}</p>
                    </div>
                  </td>
                </tr>
              ) : products.map((p, i) => (
                <tr key={p.id} className="table-row">
                  <td className="px-4 py-3.5 text-xs text-slate-600">{i+1}</td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-xs text-cyan-400 bg-cyan-500/5 border border-cyan-500/15 px-2 py-0.5 rounded-lg">{p.product_code}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-semibold text-slate-200">{p.name}</p>
                    {p.description && <p className="text-[10px] text-slate-600 truncate max-w-[200px]">{p.description}</p>}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="badge bg-violet-500/10 text-violet-400 border border-violet-500/20">{p.category?.name || '—'}</span>
                  </td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-slate-300">₹{p.unit_price.toFixed(2)}</td>
                  <td className="px-4 py-3.5">
                    <span className={`badge border ${p.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {canManage() && (
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => navigate(`/products/edit/${p.id}`)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        {isSuperAdmin() && (
                          <button onClick={() => handleDelete(p.id, p.name)} disabled={deleting === p.id}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all disabled:opacity-40" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && products.length > 0 && (
          <div className="px-4 py-3 border-t border-white/5">
            <p className="text-xs text-slate-500">Showing {products.length} product{products.length !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>
    </div>
  )
}
