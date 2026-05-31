import React from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Bell } from 'lucide-react'

const PAGE_TITLES = {
  '/dashboard':    { title: 'Dashboard',        sub: 'Overview & Analytics' },
  '/products':     { title: 'Products',         sub: 'Manage warehouse products' },
  '/products/new': { title: 'Add Product',      sub: 'Create a new product' },
  '/inventory':    { title: 'Inventory',        sub: 'Stock management' },
  '/categories':   { title: 'Categories',       sub: 'Product categories' },
  '/users':        { title: 'User Management',  sub: 'Manage system users' },
  '/reports':      { title: 'Reports',          sub: 'Analytics & insights' },
  '/profile':      { title: 'Settings',         sub: 'Account preferences' },
}

export default function TopNav() {
  const { user } = useAuth()
  const location = useLocation()

  // Match edit routes too
  let pageInfo = PAGE_TITLES[location.pathname]
  if (!pageInfo && location.pathname.startsWith('/products/edit')) {
    pageInfo = { title: 'Edit Product', sub: 'Update product details' }
  }
  if (!pageInfo) pageInfo = { title: 'Page', sub: '' }

  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-slate-950/50 backdrop-blur-sm flex-shrink-0">
      <div>
        <h1 className="text-base font-bold text-white">{pageInfo.title}</h1>
        <p className="text-xs text-slate-500">{pageInfo.sub}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-mono bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/5">
          <span>{dateStr}</span>
          <span className="text-slate-700">·</span>
          <span className="text-cyan-400">{timeStr}</span>
        </div>

        <button className="relative w-9 h-9 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all">
          <Bell size={15} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-cyan-400 rounded-full" />
        </button>

        <div className="flex items-center gap-2 bg-slate-900/60 border border-white/5 rounded-xl px-3 py-1.5">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">{user?.name?.[0]?.toUpperCase()}</span>
          </div>
          <span className="text-sm text-slate-300 font-medium hidden sm:block">{user?.name}</span>
        </div>
      </div>
    </header>
  )
}
