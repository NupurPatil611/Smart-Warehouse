import React from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Bell, Sun, Moon } from 'lucide-react'

const PAGE_TITLES = {
  '/dashboard':    { title: 'Dashboard',       sub: 'Overview & Analytics' },
  '/products':     { title: 'Products',        sub: 'Manage warehouse products' },
  '/products/new': { title: 'Add Product',     sub: 'Create a new product' },
  '/inventory':    { title: 'Inventory',       sub: 'Stock management' },
  '/categories':   { title: 'Categories',     sub: 'Product categories' },
  '/users':        { title: 'User Management', sub: 'Manage system users' },
  '/reports':      { title: 'Reports',         sub: 'Analytics & insights' },
  '/profile':      { title: 'Settings',        sub: 'Account preferences' },
}

export default function TopNav() {
  const { user } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()

  let pageInfo = PAGE_TITLES[location.pathname]
  if (!pageInfo && location.pathname.startsWith('/products/edit')) {
    pageInfo = { title: 'Edit Product', sub: 'Update product details' }
  }
  if (!pageInfo) pageInfo = { title: 'Page', sub: '' }

  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <header className={`h-16 flex items-center justify-between px-6 border-b flex-shrink-0 transition-all duration-300 ${
      isDark ? 'bg-slate-950/50 border-white/5' : 'bg-white border-gray-200 shadow-sm'
    }`}>
      <div>
        <h1 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {pageInfo.title}
        </h1>
        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
          {pageInfo.sub}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Date Time */}
        <div className={`hidden md:flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg border ${
          isDark ? 'bg-slate-900/60 border-white/5 text-slate-500' : 'bg-gray-100 border-gray-200 text-gray-500'
        }`}>
          <span>{dateStr}</span>
          <span>·</span>
          <span className="text-cyan-500">{timeStr}</span>
        </div>

        {/* 🌙 Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-300 ${
            isDark
              ? 'bg-slate-900/60 border-white/5 hover:border-amber-400/30 hover:bg-amber-400/10'
              : 'bg-gray-100 border-gray-200 hover:border-blue-400/30 hover:bg-blue-50'
          }`}
        >
          {isDark
            ? <Sun size={15} className="text-amber-400" />
            : <Moon size={15} className="text-blue-500" />
          }
        </button>

        {/* Bell */}
        <button className={`relative w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
          isDark ? 'bg-slate-900/60 border-white/5 text-slate-400' : 'bg-gray-100 border-gray-200 text-gray-500'
        }`}>
          <Bell size={15} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-cyan-400 rounded-full" />
        </button>

        {/* User */}
        <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 border ${
          isDark ? 'bg-slate-900/60 border-white/5' : 'bg-gray-100 border-gray-200'
        }`}>
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">{user?.name?.[0]?.toUpperCase()}</span>
          </div>
          <span className={`text-sm font-medium hidden sm:block ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  )
}