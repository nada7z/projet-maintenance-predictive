import React, { useState, useEffect, useMemo } from 'react'
import api from '../api/axiosConfig'
import { Bell, CheckCircle, AlertTriangle, Info, Clock, CheckCheck } from 'lucide-react'
import Badge, { ALERT_SEVERITY } from '../components/Badge'
import { ListSkeleton, EmptyState } from '../components/ListState'

const SEVERITY_ICON = {
    critical: { icon: AlertTriangle, bg: 'bg-red-50', color: 'text-red-600' },
    warning: { icon: AlertTriangle, bg: 'bg-amber-50', color: 'text-amber-600' },
    info: { icon: Info, bg: 'bg-blue-50', color: 'text-blue-600' },
}

const FILTERS = [
    { value: '', label: 'Toutes' },
    { value: 'critical', label: 'Critique' },
    { value: 'warning', label: 'Avertissement' },
    { value: 'info', label: 'Information' },
]

const AlertsList = () => {
    const [alerts, setAlerts] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('')

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const response = await api.get('/alerts/')
                setAlerts(response.data)
            } catch (error) {
                console.error('Erreur', error)
            } finally {
                setLoading(false)
            }
        }
        fetchAlerts()
    }, [])

    const markAsRead = async (id) => {
        try {
            await api.post(`/alerts/${id}/mark_read/`)
            setAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, is_read: true } : alert)))
        } catch (error) {
            console.error('Erreur lors du marquage', error)
        }
    }

    const markAllAsRead = async () => {
        const unread = alerts.filter((a) => !a.is_read)
        setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })))
        try {
            await Promise.all(unread.map((a) => api.post(`/alerts/${a.id}/mark_read/`)))
        } catch (error) {
            console.error('Erreur lors du marquage global', error)
        }
    }

    const filteredAlerts = useMemo(
        () => (filter ? alerts.filter((a) => a.severity === filter) : alerts),
        [alerts, filter]
    )
    const unreadCount = alerts.filter((a) => !a.is_read).length

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Alertes</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est à jour'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-1.5 text-sm font-medium text-slate-600 border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors duration-150"
                    >
                        <CheckCheck size={15} />
                        Tout marquer comme lu
                    </button>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                {FILTERS.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors duration-150 ${filter === f.value
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {loading && <ListSkeleton rows={5} />}

                {!loading && filteredAlerts.length === 0 && (
                    <EmptyState
                        icon={Bell}
                        title="Aucune alerte"
                        description={filter ? "Aucune alerte ne correspond à ce filtre." : "Vous serez notifié ici en cas de risque ou d'échéance."}
                    />
                )}

                {!loading && filteredAlerts.length > 0 && (
                    <div className="divide-y divide-slate-100">
                        {filteredAlerts.map((alert) => {
                            const severity = SEVERITY_ICON[alert.severity] || SEVERITY_ICON.info
                            const badge = ALERT_SEVERITY[alert.severity] || { label: alert.severity, tone: 'neutral' }
                            const Icon = severity.icon
                            return (
                                <div
                                    key={alert.id}
                                    className={`flex items-start gap-4 p-4 transition-colors duration-150 ${!alert.is_read ? 'bg-blue-50/40' : ''
                                        }`}
                                >
                                    <div className={`w-9 h-9 rounded-lg ${severity.bg} flex items-center justify-center flex-shrink-0`}>
                                        <Icon size={16} className={severity.color} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-medium text-slate-800">{alert.machine || 'Machine'}</p>
                                            {!alert.is_read && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />}
                                            <Badge tone={badge.tone}>{badge.label}</Badge>
                                        </div>
                                        <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                                        <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(alert.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {!alert.is_read ? (
                                            <button
                                                onClick={() => markAsRead(alert.id)}
                                                className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors duration-150"
                                            >
                                                <CheckCircle size={14} />
                                                <span className="hidden sm:inline">Marquer lu</span>
                                            </button>
                                        ) : (
                                            <span className="text-xs text-slate-400">Lu</span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default AlertsList