import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { Package, Users, Boxes, Tag, AlertTriangle, DollarSign, RefreshCw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#06b6d4','#3b82f6','#8b5cf6','#10b981','#f59e0b','#f43f5e']

function StatCard({ icon: Icon, label, value, colorClass, borderClass }) {
  return (
    <div className={`glass-card p-5 border ${borderClass} hover:scale-[1.01] transition-transform duration-200`}>
      <div className={`w-10 h-10 rounded-xl bg-slate-900/60 flex items-center justify-center mb-4 ${colorClass}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-3 py-2 border border-white/10 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>)}
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await api.get('/dashboard/stats')
      setStats(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchStats() }, [])

  const chartData = stats?.category_breakdown?.map(c => ({
    name: c.code,
    Products: c.product_count,
    Stock: c.total_stock,
  })) || []

  const CARDS = [
    { icon: Package,       label: 'Total Products',  value: stats?.total_products,       colorClass: 'text-cyan-400',    borderClass: 'border-cyan-500/15' },
    { icon: Boxes,         label: 'Inventory Items', value: stats?.total_inventory_items, colorClass: 'text-blue-400',    borderClass: 'border-blue-500/15' },
    { icon: Tag,           label: 'Categories',      value: stats?.total_categories,      colorClass: 'text-violet-400',  borderClass: 'border-violet-500/15' },
    { icon: Users,         label: 'Active Users',    value: stats?.total_users,           colorClass: 'text-emerald-400', borderClass: 'border-emerald-500/15' },
    { icon: AlertTriangle, label: 'Low Stock',       value: stats?.low_stock_items,       colorClass: 'text-amber-400',   borderClass: 'border-amber-500/15' },
    { icon: DollarSign,    label: 'Stock Value',     value: `₹${(stats?.total_stock_value||0).toLocaleString()}`, colorClass: 'text-rose-400', borderClass: 'border-rose-500/15' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Loading dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="glass-card p-5 border border-cyan-500/10 bg-gradient-to-r from-cyan-500/5 to-blue-500/5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">Here's your warehouse overview.</p>
          </div>
          <button onClick={fetchStats} className="btn-secondary flex items-center gap-2 text-xs">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {CARDS.map((c, i) => <StatCard key={i} {...c} />)}
      </div>

      {/* Chart + Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 glass-card p-5">
          <h3 className="text-sm font-bold text-white mb-1">Inventory by Category</h3>
          <p className="text-xs text-slate-500 mb-4">Products and stock per category</p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={18} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill:'#64748b', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#64748b', fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Products" fill="#06b6d4" radius={[4,4,0,0]} />
                <Bar dataKey="Stock"    fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-slate-500 text-sm">
              No data yet — add categories & products to see analytics.
            </div>
          )}
        </div>

        {/* Low stock alerts */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={15} className="text-amber-400" />
            <h3 className="text-sm font-bold text-white">Low Stock Alerts</h3>
            {stats?.low_stock_items > 0 && (
              <span className="ml-auto badge bg-amber-500/15 text-amber-400 border border-amber-500/20">{stats.low_stock_items}</span>
            )}
          </div>
          <div className="space-y-2.5">
            {stats?.low_stock_alerts?.length > 0 ? stats.low_stock_alerts.map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-xs font-semibold text-slate-200 truncate pr-2">{item.product_name}</p>
                  <span className="badge bg-rose-500/10 text-rose-400 border border-rose-500/20 flex-shrink-0">{item.quantity} left</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono">{item.product_code}</p>
                <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                    style={{ width: `${Math.min((item.quantity / Math.max(item.min_stock_level, 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )) : (
              <div className="py-8 text-center">
                <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-500/10 flex items-center justify-center mb-2">
                  <Package size={18} className="text-emerald-400" />
                </div>
                <p className="text-xs text-slate-500">All stock levels healthy ✓</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category overview */}
      {stats?.category_breakdown?.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold text-white mb-4">Category Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.category_breakdown.map((cat, i) => (
              <div key={i} className="p-4 rounded-xl border border-white/5 bg-slate-900/40 hover:border-white/10 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs font-bold text-slate-300 font-mono">{cat.code}</span>
                </div>
                <p className="text-lg font-bold text-white">{cat.product_count}</p>
                <p className="text-[10px] text-slate-500">Products</p>
                <p className="text-sm font-semibold text-slate-300 mt-1">{cat.total_stock}</p>
                <p className="text-[10px] text-slate-600">Stock units</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
