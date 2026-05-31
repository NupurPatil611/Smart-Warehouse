import React, { useEffect, useState } from 'react'
import api from '../utils/api'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Package, BarChart3, TrendingUp, DollarSign } from 'lucide-react'

const COLORS = ['#06b6d4','#3b82f6','#8b5cf6','#10b981','#f59e0b','#f43f5e']

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-3 py-2 border border-white/10 text-xs">
      {label && <p className="text-slate-400 mb-1">{label}</p>}
      {payload.map((p, i) => <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>)}
    </div>
  )
}

export default function ReportsPage() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
    </div>
  )

  const barData = stats?.category_breakdown?.map(c => ({
    name: c.name, Products: c.product_count, Stock: c.total_stock,
  })) || []

  const pieData = stats?.category_breakdown?.filter(c => c.product_count > 0).map(c => ({
    name: c.name, value: c.product_count,
  })) || []

  const healthy = (stats?.total_inventory_items||0) - (stats?.low_stock_items||0) - (stats?.out_of_stock||0)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white">Reports & Analytics</h2>
        <p className="text-xs text-slate-500">Warehouse performance insights</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Package,   label:'Total Products',   value: stats?.total_products,      color:'text-cyan-400' },
          { icon: BarChart3, label:'Categories',       value: stats?.total_categories,    color:'text-blue-400' },
          { icon: TrendingUp,label:'Low Stock Alerts', value: stats?.low_stock_items,     color:'text-amber-400' },
          { icon: DollarSign,label:'Total Stock Value',value:`₹${(stats?.total_stock_value||0).toLocaleString()}`, color:'text-emerald-400' },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <div key={i} className="glass-card p-5">
            <Icon size={18} className={`${color} mb-3`} />
            <p className="text-xl font-bold text-white">{value ?? '—'}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <div className="xl:col-span-3 glass-card p-5">
          <h3 className="text-sm font-bold text-white mb-1">Products & Stock by Category</h3>
          <p className="text-xs text-slate-500 mb-4">Side-by-side category comparison</p>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill:'#64748b', fontSize:10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#64748b', fontSize:10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Legend wrapperStyle={{ fontSize:'11px', color:'#64748b' }} />
                <Bar dataKey="Products" fill="#06b6d4" radius={[4,4,0,0]} barSize={14} />
                <Bar dataKey="Stock"    fill="#8b5cf6" radius={[4,4,0,0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-52 flex items-center justify-center text-slate-500 text-sm">No data yet</div>}
        </div>

        <div className="xl:col-span-2 glass-card p-5">
          <h3 className="text-sm font-bold text-white mb-1">Product Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">By category</p>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                    {pieData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<Tip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i%COLORS.length] }} />
                      <span className="text-slate-400">{d.name}</span>
                    </div>
                    <span className="font-semibold text-slate-300">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="h-52 flex items-center justify-center text-slate-500 text-sm">No data yet</div>}
        </div>
      </div>

      {/* Stock health */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-bold text-white mb-4">Stock Health</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label:'Healthy Stock', value: Math.max(healthy,0), color:'emerald' },
            { label:'Low Stock',     value: stats?.low_stock_items||0, color:'amber' },
            { label:'Out of Stock',  value: stats?.out_of_stock||0,    color:'rose' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`p-4 rounded-xl bg-${color}-500/5 border border-${color}-500/15`}>
              <p className={`text-2xl font-bold text-${color}-400`}>{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
