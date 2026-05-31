import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { Boxes, Edit2, Check, X, Search, AlertTriangle } from 'lucide-react'

function StockBar({ quantity, min, max }) {
  const pct = Math.min((quantity / Math.max(max, 1)) * 100, 100)
  const isLow = quantity <= min
  const color = isLow
    ? 'from-rose-500 to-amber-500'
    : pct > 80 ? 'from-emerald-500 to-cyan-500'
    : 'from-cyan-500 to-blue-500'
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-slate-500 w-7 text-right">{Math.round(pct)}%</span>
    </div>
  )
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [showLow, setShowLow]     = useState(false)
  const [editing, setEditing]     = useState(null)
  const [editQty, setEditQty]     = useState('')
  const [editLoc, setEditLoc]     = useState('')
  const [saving, setSaving]       = useState(false)
  const { hasRole } = useAuth()
  const canEdit = hasRole('super_admin', 'admin', 'staff')

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const params = showLow ? { low_stock: true } : {}
      const res = await api.get('/inventory', { params })
      setInventory(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchInventory() }, [showLow])

  const filtered = inventory.filter(item => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      item.product?.name?.toLowerCase().includes(q) ||
      item.inventory_id?.toLowerCase().includes(q) ||
      item.product?.product_code?.toLowerCase().includes(q)
    )
  })

  const lowCount = inventory.filter(i => i.quantity <= i.min_stock_level).length

  const startEdit = (item) => { setEditing(item.id); setEditQty(String(item.quantity)); setEditLoc(item.location || '') }
  const cancelEdit = () => { setEditing(null) }

  const saveEdit = async (item) => {
    setSaving(true)
    try {
      await api.put(`/inventory/${item.id}`, {
        quantity: parseInt(editQty),
        location: editLoc || null,
        min_stock_level: item.min_stock_level,
        max_stock_level: item.max_stock_level,
      })
      setInventory(prev => prev.map(i =>
        i.id === item.id ? { ...i, quantity: parseInt(editQty), location: editLoc } : i
      ))
      cancelEdit()
    } catch (e) { alert(e.response?.data?.detail || 'Update failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Inventory</h2>
          <p className="text-xs text-slate-500">{inventory.length} items tracked</p>
        </div>
        {lowCount > 0 && (
          <button
            onClick={() => setShowLow(!showLow)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              showLow
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:border-amber-500/40'
            }`}
          >
            <AlertTriangle size={13} />
            {showLow ? 'Show All' : `${lowCount} Low Stock`}
          </button>
        )}
      </div>

      {/* Search */}
      <div className="glass-card p-4">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by product name, code, or inventory ID..."
            className="input-field pl-10" />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Inventory ID','Product','Category','Stock Bar','Qty','Location','Status', canEdit && 'Actions'].filter(Boolean).map(h => (
                  <th key={h} className={`px-4 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest ${h==='Actions'?'text-right':'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_,i) => (
                  <tr key={i} className="border-b border-white/5">
                    {[...Array(8)].map((_,j) => <td key={j} className="px-4 py-3.5"><div className="h-4 bg-slate-800 rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                        <Boxes size={20} className="text-slate-600" />
                      </div>
                      <p className="text-slate-400 text-sm">No inventory items found</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(item => {
                const isLow = item.quantity <= item.min_stock_level
                const isEditing = editing === item.id
                return (
                  <tr key={item.id} className={`table-row ${isLow ? 'bg-amber-500/[0.02]' : ''}`}>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs text-violet-400 bg-violet-500/5 border border-violet-500/15 px-2 py-0.5 rounded-lg">{item.inventory_id}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-slate-200">{item.product?.name}</p>
                      <span className="font-mono text-[10px] text-cyan-400">{item.product?.product_code}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="badge bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        {item.product?.category?.name || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StockBar quantity={item.quantity} min={item.min_stock_level} max={item.max_stock_level} />
                      <p className="text-[10px] text-slate-700 mt-1">Min:{item.min_stock_level} Max:{item.max_stock_level}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      {isEditing ? (
                        <input type="number" value={editQty} onChange={e => setEditQty(e.target.value)}
                          min="0" className="input-field w-20 py-1.5 text-sm" autoFocus />
                      ) : (
                        <span className={`text-lg font-bold ${isLow ? 'text-amber-400' : 'text-white'}`}>{item.quantity}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {isEditing ? (
                        <input value={editLoc} onChange={e => setEditLoc(e.target.value)}
                          className="input-field w-24 py-1.5 text-sm" placeholder="A-01" />
                      ) : (
                        <span className="text-xs text-slate-400">{item.location || '—'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {item.quantity === 0
                        ? <span className="badge bg-rose-500/10 text-rose-400 border border-rose-500/20">Out of Stock</span>
                        : isLow
                        ? <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20">Low Stock</span>
                        : <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">In Stock</span>
                      }
                    </td>
                    {canEdit && (
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {isEditing ? (
                            <>
                              <button onClick={() => saveEdit(item)} disabled={saving}
                                className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all disabled:opacity-50"><Check size={14} /></button>
                              <button onClick={cancelEdit}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"><X size={14} /></button>
                            </>
                          ) : (
                            <button onClick={() => startEdit(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"><Edit2 size={14} /></button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
