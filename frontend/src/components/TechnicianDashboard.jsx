import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axiosConfig'
import { Doughnut } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js'
import {
    ClipboardList,
    CheckCircle,
    Clock,
    AlertCircle,
    Calendar,
    Bell,
    Wrench,
    Loader2,
} from 'lucide-react'

ChartJS.register(ArcElement, Tooltip, Legend)

const ACCENT = '#2563EB'
const SUCCESS = '#16A34A'
const WARNING = '#D97706'
const DANGER = '#DC2626'

const chartTooltip = {
    backgroundColor: '#0F172A',
    titleColor: '#F8FAFC',
    titleFont: { size: 12, weight: '500' },
    bodyColor: '#CBD5E1',
    bodyFont: { size: 12 },
    cornerRadius: 8,
    padding: 10,
    displayColors: false,
}

const TechnicianDashboard = () => {
    const { user } = useAuth()
    const [interventions, setInterventions] = useState([])
    const [alerts, setAlerts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [intervRes, alertsRes] = await Promise.all([
                    api.get('/interventions/'),
                    api.get('/alerts/?limit=5&ordering=-created_at'),
                ])
                setInterventions(intervRes.data)
                setAlerts(alertsRes.data)
            } catch (error) {
                console.error('Erreur chargement données technicien', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return <DashboardSkeleton />
    }

    // Statistiques
    const total = interventions.length
    const completed = interventions.filter(i => i.status === 'completed').length
    const inProgress = interventions.filter(i => i.status === 'in_progress').length
    const planned = interventions.filter(i => i.status === 'planned').length
    const overdue = interventions.filter(i => i.status === 'planned' && new Date(i.planned_start) < new Date()).length

    // Données pour le graphique
    const doughnutData = {
        labels: ['Terminées', 'En cours', 'Planifiées', 'En retard'],
        datasets: [
            {
                data: [completed, inProgress, planned, overdue],
                backgroundColor: [SUCCESS, ACCENT, WARNING, DANGER],
                borderWidth: 3,
                borderColor: '#FFFFFF',
            },
        ],
    }
    const doughnutOptions = {
        cutout: '78%',
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: chartTooltip,
        },
    }

    // KPI Cards
    const kpiCards = [
        { label: 'Total interventions', value: total, icon: ClipboardList, accent: ACCENT, soft: '#EFF4FF' },
        { label: 'Terminées', value: completed, icon: CheckCircle, accent: SUCCESS, soft: '#F0FDF4' },
        { label: 'En cours', value: inProgress, icon: Loader2, accent: ACCENT, soft: '#EFF4FF' },
        { label: 'Planifiées', value: planned, icon: Calendar, accent: WARNING, soft: '#FFFBEB' },
    ]

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Mon tableau de bord</h1>
                <p className="text-sm text-slate-500 mt-1">Vue d'ensemble de vos interventions et alertes</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((card, idx) => {
                    const Icon = card.icon
                    return (
                        <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.soft }}>
                                <Icon size={18} style={{ color: card.accent }} />
                            </div>
                            <p className="text-2xl font-semibold text-slate-900 mt-4 tracking-tight">{card.value}</p>
                            <p className="text-xs font-medium text-slate-500 mt-1">{card.label}</p>
                        </div>
                    )
                })}
            </div>

            {/* Doughnut + Alerte Overdue */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col items-center">
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">Répartition des interventions</h3>
                    <p className="text-xs text-slate-500 mb-5">Statut de vos interventions assignées</p>
                    <div className="relative w-full h-48">
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-semibold text-slate-900">{total}</span>
                            <span className="text-[11px] text-slate-500">total</span>
                        </div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 w-full text-sm">
                        {doughnutData.labels.map((label, i) => (
                            <div key={label} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: doughnutData.datasets[0].backgroundColor[i] }} />
                                    <span className="text-slate-600">{label}</span>
                                </div>
                                <span className="font-medium text-slate-900">{doughnutData.datasets[0].data[i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center gap-2 mb-5">
                        <Clock size={16} className="text-slate-500" />
                        <h3 className="text-sm font-semibold text-slate-800">Vos interventions récentes</h3>
                        <span className="ml-auto text-xs text-slate-400">
                            {interventions.length > 5 ? `+ ${interventions.length - 5} autres` : ''}
                        </span>
                    </div>
                    {interventions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Wrench size={28} className="text-slate-300 mb-3" />
                            <p className="text-sm text-slate-500">Aucune intervention assignée pour le moment</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {interventions.slice(0, 5).map((inv) => {
                                const statusMap = {
                                    planned: { label: 'Planifiée', color: WARNING },
                                    in_progress: { label: 'En cours', color: ACCENT },
                                    completed: { label: 'Terminée', color: SUCCESS },
                                    cancelled: { label: 'Annulée', color: '#94A3B8' },
                                }
                                const st = statusMap[inv.status] || { label: inv.status, color: '#94A3B8' }
                                return (
                                    <Link
                                        key={inv.id}
                                        to={`/interventions/${inv.id}`}
                                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors duration-150"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: st.color }} />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-800 truncate">
                                                    {inv.machine || 'Machine inconnue'} – {inv.type}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {new Date(inv.planned_start).toLocaleDateString()} à {new Date(inv.planned_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium text-slate-600 whitespace-nowrap ml-2">
                                            {st.label}
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Alertes récentes */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="flex items-center gap-2 mb-5">
                    <Bell size={16} className="text-red-500" />
                    <h3 className="text-sm font-semibold text-slate-800">Alertes récentes</h3>
                    {alerts.length > 0 && (
                        <span className="ml-auto text-xs text-slate-400">
                            {alerts.filter(a => !a.is_read).length} non lues
                        </span>
                    )}
                </div>
                {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <AlertCircle size={24} className="text-slate-300 mb-2" />
                        <p className="text-sm text-slate-500">Aucune alerte pour le moment</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {alerts.slice(0, 3).map((alert) => (
                            <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border-l-[3px] border-l-red-500">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-800">{alert.type}</p>
                                    <p className="text-sm text-slate-600 mt-0.5">{alert.message}</p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {new Date(alert.created_at).toLocaleString()}
                                    </p>
                                </div>
                                {!alert.is_read && (
                                    <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                                )}
                            </div>
                        ))}
                        {alerts.length > 3 && (
                            <Link to="/alerts" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-150 block text-center mt-3">
                                Voir toutes les alertes →
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

const DashboardSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 rounded" />
            <div className="h-4 w-64 bg-slate-100 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 space-y-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100" />
                    <div className="h-6 w-16 bg-slate-200 rounded" />
                    <div className="h-3 w-20 bg-slate-100 rounded" />
                </div>
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-6 border border-slate-200 h-80" />
            <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 h-80" />
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 h-48" />
    </div>
)

export default TechnicianDashboard