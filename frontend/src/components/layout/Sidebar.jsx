import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Package, Boxes, Tag, Users,
  BarChart3, Settings, LogOut, Warehouse,
  ChevronLeft, ChevronRight, User
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: null },
  { to: '/products',  icon: Package,         label: 'Products',  roles: null },
  { to: '/inventory', icon: Boxes,           label: 'Inventory', roles: null },
  { to: '/categories',icon: Tag,             label: 'Categories',roles: null },
  { to: '/users',     icon: Users,           label: 'Users',     roles: ['super_admin','admin'] },
  { to: '/reports',   icon: BarChart3,       label: 'Reports',   roles: null },
  { to: '/profile',   icon: Settings,        label: 'Settings',  roles: null },
]

const ROLE_STYLE = {
  super_admin: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  admin:       'text-cyan-400   bg-cyan-500/10   border-cyan-500/20',
  staff:       'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  buyer:       'text-amber-400  bg-amber-500/10  border-amber-500/20',
}

export default function Sidebar() {
  const { user, logout, hasRole } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const visibleItems = NAV_ITEMS.filter(item =>
    !item.roles || (user && item.roles.includes(user.role))
  )

  return (
    <aside className={`relative flex flex-col h-full bg-slate-950/95 border-r border-white/5 transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-16' : 'w-64'}`}>

      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/5 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/25">
          <Warehouse size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white leading-tight">Smart Warehouse</p>
            <p className="text-[10px] text-slate-500">Management System</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-slate-800 border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-all z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-3">Menu</p>
        )}
        {visibleItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${isActive ? 'nav-link-active' : 'nav-link'} ${collapsed ? 'justify-center px-2' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className={`border-t border-white/5 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-slate-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
              <span className={`badge border text-[10px] ${ROLE_STYLE[user?.role] || 'text-slate-400'}`}>
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  )
}
