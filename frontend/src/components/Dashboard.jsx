import React, { useState, useEffect } from 'react'
import api from '../api/axiosConfig'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js'
import {
    Package,
    Wrench,
    Clock,
    Gauge,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    ChevronDown,
} from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

// Palette unique et restreinte : un accent (bleu) + des couleurs sémantiques
// réservées à leur usage réel (statut, tendance), jamais décoratives.
const COLORS = {
    accent: '#2563EB',
    accentSoft: '#EFF4FF',
    success: '#16A34A',
    successSoft: '#F0FDF4',
    warning: '#D97706',
    warningSoft: '#FFFBEB',
    danger: '#DC2626',
    dangerSoft: '#FEF2F2',
    slate: '#64748B',
}

const Dashboard = () => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/stats/')
                setStats(response.data)
            } catch (error) {
                console.error('Erreur', error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) {
        return <DashboardSkeleton />
    }

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertTriangle size={22} className="text-red-500" />
                </div>
                <div>
                    <p className="font-medium text-slate-800">Impossible de charger les données</p>
                    <p className="text-sm text-slate-500 mt-0.5">Vérifiez la connexion à l'API et réessayez.</p>
                </div>
            </div>
        )
    }

    const kpiCards = [
        {
            label: 'Total machines',
            value: stats.total_machines,
            delta: stats.total_machines_delta,
            icon: Package,
            accent: COLORS.accent,
            accentSoft: COLORS.accentSoft,
        },
        {
            label: 'Disponibilité',
            value: `${stats.availability}%`,
            delta: stats.availability_delta,
            icon: Gauge,
            accent: COLORS.success,
            accentSoft: COLORS.successSoft,
        },
        {
            label: 'MTTR moyen',
            value: `${stats.avg_mttr} min`,
            delta: stats.avg_mttr_delta,
            deltaInverse: true,
            icon: Clock,
            accent: COLORS.warning,
            accentSoft: COLORS.warningSoft,
        },
        {
            label: 'Interventions',
            value: stats.total_interventions,
            delta: stats.total_interventions_delta,
            icon: Wrench,
            accent: COLORS.accent,
            accentSoft: COLORS.accentSoft,
        },
    ]

    const barData = {
        labels: stats.monthly_interventions.map((item) => item.month),
        datasets: [
            {
                label: 'Interventions',
                data: stats.monthly_interventions.map((item) => item.count),
                backgroundColor: COLORS.accent,
                borderRadius: 5,
                barPercentage: 0.5,
                categoryPercentage: 0.7,
            },
        ],
    }

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0F172A',
                titleColor: '#F8FAFC',
                titleFont: { size: 12, weight: '500' },
                bodyColor: '#CBD5E1',
                bodyFont: { size: 12 },
                cornerRadius: 8,
                padding: 10,
                displayColors: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                border: { display: false },
                grid: { color: '#F1F5F9' },
                ticks: { color: '#94A3B8', font: { size: 11 }, padding: 8 },
            },
            x: {
                border: { display: false },
                grid: { display: false },
                ticks: { color: '#64748B', font: { size: 11 }, padding: 6 },
            },
        },
    }

    const machineTotal = stats.machines_active + stats.machines_maintenance + stats.machines_out

    const doughnutData = {
        labels: ['Actives', 'En maintenance', 'Hors service'],
        datasets: [
            {
                data: [stats.machines_active, stats.machines_maintenance, stats.machines_out],
                backgroundColor: [COLORS.success, COLORS.warning, COLORS.danger],
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
            tooltip: {
                backgroundColor: '#0F172A',
                titleColor: '#F8FAFC',
                bodyColor: '#CBD5E1',
                cornerRadius: 8,
                padding: 10,
                displayColors: false,
            },
        },
    }

    const legendItems = [
        { label: 'Actives', value: stats.machines_active, color: COLORS.success },
        { label: 'En maintenance', value: stats.machines_maintenance, color: COLORS.warning },
        { label: 'Hors service', value: stats.machines_out, color: COLORS.danger },
    ]

    return (
        <div className="space-y-6">
            {/* En-tete */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Tableau de bord</h1>
                    <p className="text-sm text-slate-500 mt-1">Vue d'ensemble de la maintenance prédictive</p>
                </div>
                <button className="flex items-center gap-2 text-sm bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors duration-150">
                    <Calendar size={15} className="text-slate-400" />
                    <span className="text-slate-700 font-medium">Ce mois</span>
                    <ChevronDown size={14} className="text-slate-400" />
                </button>
            </div>

            {/* Cartes KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {kpiCards.map((card, idx) => {
                    const Icon = card.icon
                    const isPositive = card.deltaInverse ? card.delta < 0 : card.delta > 0
                    return (
                        <div
                            key={idx}
                            className="bg-white rounded-xl p-5 border border-slate-200 transition-colors duration-150 hover:border-slate-300"
                        >
                            <div className="flex items-start justify-between">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: card.accentSoft }}
                                >
                                    <Icon size={18} style={{ color: card.accent }} />
                                </div>
                                {typeof card.delta === 'number' && (
                                    <span
                                        className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded ${isPositive
                                            ? 'text-emerald-700 bg-emerald-50'
                                            : 'text-red-700 bg-red-50'
                                            }`}
                                    >
                                        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                        {Math.abs(card.delta)}%
                                    </span>
                                )}
                            </div>
                            <p className="text-2xl font-semibold text-slate-900 mt-4 tracking-tight">
                                {card.value}
                            </p>
                            <p className="text-xs font-medium text-slate-500 mt-1">{card.label}</p>
                        </div>
                    )
                })}
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2 bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800">Évolution des interventions</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Nombre d'interventions par mois</p>
                        </div>
                    </div>
                    <div className="h-64">
                        <Bar data={barData} options={barOptions} />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-800 mb-6">État du parc</h3>
                    <div className="relative w-full h-40">
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-semibold text-slate-900">{machineTotal}</span>
                            <span className="text-[11px] text-slate-500">machines</span>
                        </div>
                    </div>
                    <div className="mt-6 space-y-3">
                        {legendItems.map((item) => (
                            <div key={item.label} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-slate-600">{item.label}</span>
                                </div>
                                <span className="font-medium text-slate-900">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Alerte */}
            {stats.pending_maintenance_count > 0 && (
                <div className="bg-white border border-slate-200 border-l-[3px] border-l-amber-500 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle size={17} className="text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-slate-900 text-sm">Maintenance préventive</p>
                        <p className="text-slate-500 text-sm mt-0.5">
                            {stats.pending_maintenance_count} machine{stats.pending_maintenance_count > 1 ? 's' : ''} nécessite
                            {stats.pending_maintenance_count > 1 ? 'nt' : ''} une intervention dans les 48 heures.
                        </p>
                    </div>
                    <button className="flex-shrink-0 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-150">
                        Voir les alertes
                    </button>
                </div>
            )}
        </div>
    )
}

const DashboardSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
            <div className="space-y-2">
                <div className="h-6 w-48 bg-slate-200 rounded" />
                <div className="h-4 w-64 bg-slate-100 rounded" />
            </div>
            <div className="h-9 w-28 bg-slate-100 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 space-y-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100" />
                    <div className="h-6 w-16 bg-slate-200 rounded" />
                    <div className="h-3 w-20 bg-slate-100 rounded" />
                </div>
            ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 bg-white rounded-xl p-6 border border-slate-200 h-72" />
            <div className="bg-white rounded-xl p-6 border border-slate-200 h-72" />
        </div>
    </div>
)

export default Dashboard