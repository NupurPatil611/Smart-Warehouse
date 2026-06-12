import React, { useEffect, useState } from 'react'
import api from '../utils/api'
import { useTheme } from '../context/ThemeContext'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { Package, BarChart3, TrendingUp, IndianRupee, Download } from 'lucide-react'

const COLORS = ['#06b6d4','#3b82f6','#8b5cf6','#10b981','#f59e0b','#f43f5e']

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-3 py-2 border border-white/10 text-xs">
      {label && <p className="text-slate-400 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function ReportsPage() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const { isDark } = useTheme()

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => setStats(r.data))
      .finally(() => setLoading(false))
  }, [])

  // ── Download CSV helper ──────────────────────
  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert('No data to download!')
      return
    }
    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(h => {
          const val = row[h] ?? ''
          return typeof val === 'string' && val.includes(',') ? `"${val}"` : val
        }).join(',')
      )
    ]
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadProducts = async () => {
    const res = await api.get('/products')
    const data = res.data.map(p => ({
      'Product Code': p.product_code,
      'Name': p.name,
      'Category': p.category?.name || '',
      'Price (Rs)': p.unit_price,
      'Status': p.is_active ? 'Active' : 'Inactive',
    }))
    downloadCSV(data, 'Products_Report.csv')
  }

  const handleDownloadInventory = async () => {
    const res = await api.get('/inventory')
    const data = res.data.map(item => ({
      'Inventory ID': item.inventory_id,
      'Product': item.product?.name || '',
      'Code': item.product?.product_code || '',
      'Category': item.product?.category?.name || '',
      'Quantity': item.quantity,
      'Min Stock': item.min_stock_level,
      'Location': item.location || '',
      'Status': item.quantity === 0
        ? 'Out of Stock'
        : item.quantity <= item.min_stock_level
        ? 'Low Stock'
        : 'In Stock',
    }))
    downloadCSV(data, 'Inventory_Report.csv')
  }

  const handleDownloadLowStock = async () => {
    const res = await api.get('/inventory')
    const lowStock = res.data.filter(i => i.quantity <= i.min_stock_level)
    const data = lowStock.map(item => ({
      'Product': item.product?.name || '',
      'Code': item.product?.product_code || '',
      'Current Qty': item.quantity,
      'Min Level': item.min_stock_level,
      'Need to Order': item.min_stock_level - item.quantity,
      'Location': item.location || '',
    }))
    downloadCSV(data, 'LowStock_Report.csv')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
    </div>
  )

  const barData = stats?.category_breakdown?.map(c => ({
    name: c.name, Products: c.product_count, Stock: c.total_stock,
  })) || []

  const pieData = stats?.category_breakdown
    ?.filter(c => c.product_count > 0)
    .map(c => ({ name: c.name, value: c.product_count })) || []

  const healthy = Math.max(
    (stats?.total_inventory_items || 0) - (stats?.low_stock_items || 0) - (stats?.out_of_stock || 0),
    0
  )

  const textPrimary = isDark ? 'text-white' : 'text-gray-900'
  const textMuted   = isDark ? 'text-slate-500' : 'text-gray-500'

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h2 className={`text-lg font-bold ${textPrimary}`}>Reports & Analytics</h2>
        <p className={`text-xs ${textMuted}`}>Warehouse performance insights</p>
      </div>

      {/* ── Download Section ── */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Download size={16} className="text-cyan-400" />
          <h3 className={`text-sm font-bold ${textPrimary}`}>Download Reports</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          <button
            onClick={handleDownloadProducts}
            className={`flex items-center justify-center gap-2 p-4 rounded-xl border transition-all hover:scale-[1.02] active:scale-95 ${
              isDark
                ? 'bg-slate-900/60 border-white/10 text-slate-200 hover:border-cyan-500/30 hover:bg-cyan-500/5'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-cyan-400 hover:bg-cyan-50'
            }`}
          >
            <span className="text-lg">📦</span>
            <div className="text-left">
              <p className="text-sm font-semibold">Products</p>
              <p className={`text-[10px] ${textMuted}`}>Download CSV</p>
            </div>
          </button>

          <button
            onClick={handleDownloadInventory}
            className={`flex items-center justify-center gap-2 p-4 rounded-xl border transition-all hover:scale-[1.02] active:scale-95 ${
              isDark
                ? 'bg-slate-900/60 border-white/10 text-slate-200 hover:border-blue-500/30 hover:bg-blue-500/5'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            <span className="text-lg">📊</span>
            <div className="text-left">
              <p className="text-sm font-semibold">Inventory</p>
              <p className={`text-[10px] ${textMuted}`}>Download CSV</p>
            </div>
          </button>

          <button
            onClick={handleDownloadLowStock}
            className={`flex items-center justify-center gap-2 p-4 rounded-xl border transition-all hover:scale-[1.02] active:scale-95 ${
              isDark
                ? 'bg-slate-900/60 border-white/10 text-slate-200 hover:border-amber-500/30 hover:bg-amber-500/5'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-amber-400 hover:bg-amber-50'
            }`}
          >
            <span className="text-lg">⚠️</span>
            <div className="text-left">
              <p className="text-sm font-semibold">Low Stock</p>
              <p className={`text-[10px] ${textMuted}`}>Download CSV</p>
            </div>
          </button>

        </div>
        <p className={`text-[10px] mt-3 ${textMuted}`}>
          💡 CSV files open directly in Excel or Google Sheets
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Package,     label: 'Total Products',   value: stats?.total_products,    color: 'text-cyan-400' },
          { icon: BarChart3,   label: 'Categories',       value: stats?.total_categories,  color: 'text-blue-400' },
          { icon: TrendingUp,  label: 'Low Stock Alerts', value: stats?.low_stock_items,   color: 'text-amber-400' },
          { icon: IndianRupee, label: 'Total Stock Value',
            value: `₹${(stats?.total_stock_value || 0).toLocaleString('en-IN')}`,
            color: 'text-emerald-400' },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <div key={i} className="glass-card p-5">
            <Icon size={18} className={`${color} mb-3`} />
            <p className={`text-xl font-bold ${textPrimary}`}>{value ?? '—'}</p>
            <p className={`text-xs mt-0.5 ${textMuted}`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <div className="xl:col-span-3 glass-card p-5">
          <h3 className={`text-sm font-bold mb-1 ${textPrimary}`}>Products & Stock by Category</h3>
          <p className={`text-xs mb-4 ${textMuted}`}>Side-by-side comparison</p>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                <XAxis dataKey="name" tick={{ fill:'#64748b', fontSize:10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#64748b', fontSize:10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Legend wrapperStyle={{ fontSize:'11px', color:'#64748b' }} />
                <Bar dataKey="Products" fill="#06b6d4" radius={[4,4,0,0]} barSize={14} />
                <Bar dataKey="Stock"    fill="#8b5cf6" radius={[4,4,0,0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={`h-52 flex items-center justify-center text-sm ${textMuted}`}>No data yet</div>
          )}
        </div>

        <div className="xl:col-span-2 glass-card p-5">
          <h3 className={`text-sm font-bold mb-1 ${textPrimary}`}>Product Distribution</h3>
          <p className={`text-xs mb-4 ${textMuted}`}>By category</p>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                    {pieData.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<Tip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className={textMuted}>{d.name}</span>
                    </div>
                    <span className={`font-semibold ${textPrimary}`}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className={`h-52 flex items-center justify-center text-sm ${textMuted}`}>No data yet</div>
          )}
        </div>
      </div>

      {/* Stock Health */}
      <div className="glass-card p-5">
        <h3 className={`text-sm font-bold mb-4 ${textPrimary}`}>Stock Health</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Healthy Stock', value: healthy,                     color: 'emerald' },
            { label: 'Low Stock',     value: stats?.low_stock_items || 0, color: 'amber'   },
            { label: 'Out of Stock',  value: stats?.out_of_stock    || 0, color: 'rose'    },
          ].map(({ label, value, color }) => (
            <div key={label} className={`p-4 rounded-xl bg-${color}-500/5 border border-${color}-500/15`}>
              <p className={`text-2xl font-bold text-${color}-400`}>{value}</p>
              <p className={`text-xs mt-0.5 ${textMuted}`}>{label}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}