import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    LayoutDashboard,
    Package,
    Wrench,
    Bell,
    FileText,
    LogOut,
    Menu,
    PanelLeftClose,
} from 'lucide-react'

const Layout = ({ children }) => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const navItems = [
        { path: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
        { path: '/equipment', label: 'Équipements', icon: Package },
        { path: '/interventions', label: 'Interventions', icon: Wrench },
        { path: '/alerts', label: 'Alertes', icon: Bell },
        { path: '/reports', label: 'Rapports', icon: FileText },
    ]

    const currentItem = navItems.find((item) => item.path === location.pathname)
    const initials = (user?.username || 'U').charAt(0).toUpperCase()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside
                className={`${sidebarOpen ? 'w-64' : 'w-[68px]'
                    } bg-white border-r border-slate-200 flex flex-col transition-all duration-200 fixed h-full z-50`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                            OCP
                        </div>
                        {sidebarOpen && (
                            <div className="min-w-0">
                                <p className="font-semibold text-slate-800 text-sm leading-tight truncate">Maintenance</p>
                                <p className="text-[11px] text-slate-400 leading-tight truncate">Prédictive</p>
                            </div>
                        )}
                    </div>
                    {sidebarOpen && (
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors duration-150 flex-shrink-0"
                            aria-label="Réduire le menu"
                        >
                            <PanelLeftClose size={16} />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
                    {!sidebarOpen && (
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="flex items-center justify-center w-full p-2.5 mb-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors duration-150"
                            aria-label="Ouvrir le menu"
                        >
                            <Menu size={18} />
                        </button>
                    )}
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                title={!sidebarOpen ? item.label : undefined}
                                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 ${isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-slate-600 hover:bg-slate-100'
                                    } ${!sidebarOpen ? 'justify-center' : ''}`}
                            >
                                {isActive && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-r-full bg-blue-600" />
                                )}
                                <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                                {sidebarOpen && (
                                    <span className={`text-sm ${isActive ? 'font-medium' : 'font-normal'}`}>
                                        {item.label}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="border-t border-slate-100 p-3 space-y-1">
                    <div className={`flex items-center gap-3 px-2 py-2 rounded-lg ${sidebarOpen ? 'bg-slate-50' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-medium text-xs flex-shrink-0">
                            {initials}
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate">
                                    {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username}
                                </p>
                                <p className="text-xs text-slate-400 truncate">
                                    {user?.role || 'Utilisateur'}
                                </p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        title={!sidebarOpen ? 'Déconnexion' : undefined}
                        className={`flex items-center gap-3 px-3 py-2 w-full rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-150 ${!sidebarOpen ? 'justify-center' : ''
                            }`}
                    >
                        <LogOut size={17} />
                        {sidebarOpen && <span className="text-sm">Déconnexion</span>}
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className={`flex-1 flex flex-col min-w-0 ${sidebarOpen ? 'ml-64' : 'ml-[68px]'} transition-all duration-200`}>
                {/* Header */}
                <header className="h-16 bg-white/90 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40 flex-shrink-0">
                    <div>
                        <h1 className="text-base font-semibold text-slate-800 leading-tight">
                            {currentItem?.label || 'Tableau de bord'}
                        </h1>
                        <p className="text-xs text-slate-400 leading-tight mt-0.5">
                            {user?.role ? `Connecté en tant que ${user.role}` : ' '}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors duration-150"
                            aria-label="Notifications"
                        >
                            <Bell size={18} className="text-slate-500" />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                        </button>
                        <div className="w-px h-6 bg-slate-200 mx-1" />
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-medium text-xs">
                            {initials}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <div className="flex-1 overflow-y-auto p-6">{children}</div>
            </main>
        </div>
    )
}

export default Layout