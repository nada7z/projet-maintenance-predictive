import React, { useState, useEffect } from 'react'
import api from '../api/axiosConfig'
import { Bell, CheckCircle, AlertTriangle, Info, Clock, Eye } from 'lucide-react'

const AlertsList = () => {
    const [alerts, setAlerts] = useState([])
    const [loading, setLoading] = useState(true)

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
            setAlerts(prev => prev.map(alert => alert.id === id ? { ...alert, is_read: true } : alert))
        } catch (error) {
            console.error('Erreur lors du marquage', error)
        }
    }

    const getSeverityIcon = (severity) => {
        if (severity === 'critical') return <AlertTriangle size={16} className="text-red-500" />
        if (severity === 'warning') return <AlertTriangle size={16} className="text-yellow-500" />
        return <Info size={16} className="text-blue-500" />
    }

    const getSeverityBadge = (severity) => {
        const colors = {
            critical: 'bg-red-100 text-red-700',
            warning: 'bg-yellow-100 text-yellow-700',
            info: 'bg-blue-100 text-blue-700',
        }
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[severity] || 'bg-gray-100'}`}>
                {severity}
            </span>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    const unreadCount = alerts.filter(a => !a.is_read).length

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">Alertes</h2>
                    <p className="text-sm text-gray-500">{unreadCount} non lues</p>
                </div>
                <Bell size={20} className="text-gray-400" />
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {alerts.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">Aucune alerte</div>
                    ) : (
                        alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={`flex items-start gap-4 p-4 transition ${!alert.is_read ? 'bg-blue-50/50' : ''}`}
                            >
                                <div className="flex-shrink-0 mt-0.5">
                                    {getSeverityIcon(alert.severity)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-gray-800">{alert.machine?.name || 'Machine'}</p>
                                        {!alert.is_read && (
                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                        )}
                                        {getSeverityBadge(alert.severity)}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-0.5">{alert.message}</p>
                                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                        <Clock size={12} />
                                        {new Date(alert.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    {!alert.is_read ? (
                                        <button
                                            onClick={() => markAsRead(alert.id)}
                                            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition"
                                        >
                                            <CheckCircle size={16} />
                                            <span className="hidden sm:inline">Marquer lu</span>
                                        </button>
                                    ) : (
                                        <span className="text-xs text-gray-400">Lu</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default AlertsList