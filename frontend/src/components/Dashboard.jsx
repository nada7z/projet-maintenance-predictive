import React, { useState, useEffect } from 'react'
import api from '../api/axiosConfig'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler,
} from 'chart.js'
import {
    Package,
    Wrench,
    Clock,
    Gauge,
    AlertTriangle,
    Activity,
    MapPin,
    CircleCheck,
} from 'lucide-react'
import { Select } from '../components/FormField'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
)

const ACCENT = '#2563EB'
const SUCCESS = '#16A34A'
const WARNING = '#D97706'
const DANGER = '#DC2626'

const riskColor = (score) => {
    if (score === null || score === undefined) return '#94A3B8'
    if (score > 70) return DANGER
    if (score > 40) return WARNING
    return SUCCESS
}

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

const Dashboard = () => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [machines, setMachines] = useState([])
    const [criticalMachines, setCriticalMachines] = useState([])
    const [riskHistory, setRiskHistory] = useState([])
    const [selectedMachine, setSelectedMachine] = useState(null)

    const [filterLocation, setFilterLocation] = useState('')
    const [filterCriticality, setFilterCriticality] = useState('')
    const [locations, setLocations] = useState([])

    useEffect(() => {
        const fetchMachines = async () => {
            try {
                const res = await api.get('/equipment/')
                setMachines(res.data)
                const locs = [...new Set(res.data.map((m) => m.location).filter(Boolean))]
                setLocations(locs)
                if (res.data.length > 0) {
                    setSelectedMachine(res.data[0].id)
                }
            } catch (error) {
                console.error('Erreur chargement machines', error)
            }
        }
        fetchMachines()
    }, [])

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

    useEffect(() => {
        const fetchCritical = async () => {
            try {
                const params = {}
                if (filterLocation) params.location = filterLocation
                if (filterCriticality) params.criticality = filterCriticality
                const res = await api.get('/risk/critical/', { params })
                setCriticalMachines(res.data)
            } catch (error) {
                console.error('Erreur chargement machines critiques', error)
            }
        }
        fetchCritical()
    }, [filterLocation, filterCriticality])

    useEffect(() => {
        if (!selectedMachine) return
        const fetchHistory = async () => {
            try {
                const res = await api.get(`/risk/history/${selectedMachine}/?days=7`)
                setRiskHistory(res.data)
            } catch (error) {
                console.error('Erreur chargement historique', error)
            }
        }
        fetchHistory()
    }, [selectedMachine])

    if (loading) return <DashboardSkeleton />

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
        { label: 'Total machines', value: stats.total_machines, icon: Package, accent: ACCENT, soft: '#EFF4FF' },
        { label: 'Disponibilité', value: `${stats.availability}%`, icon: Gauge, accent: SUCCESS, soft: '#F0FDF4' },
        { label: 'MTTR moyen', value: `${stats.avg_mttr} min`, icon: Clock, accent: WARNING, soft: '#FFFBEB' },
        { label: 'Interventions', value: stats.total_interventions, icon: Wrench, accent: ACCENT, soft: '#EFF4FF' },
    ]

    const barData = {
        labels: stats.monthly_interventions.map((item) => item.month),
        datasets: [
            {
                label: 'Interventions',
                data: stats.monthly_interventions.map((item) => item.count),
                backgroundColor: ACCENT,
                borderRadius: 5,
                barPercentage: 0.5,
                categoryPercentage: 0.7,
            },
        ],
    }

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: chartTooltip },
        scales: {
            y: { beginAtZero: true, border: { display: false }, grid: { color: '#F1F5F9' }, ticks: { color: '#94A3B8', font: { size: 11 }, padding: 8 } },
            x: { border: { display: false }, grid: { display: false }, ticks: { color: '#64748B', font: { size: 11 }, padding: 6 } },
        },
    }

    const machineTotal = stats.machines_active + stats.machines_maintenance + stats.machines_out
    const doughnutData = {
        labels: ['Actives', 'En maintenance', 'Hors service'],
        datasets: [
            { data: [stats.machines_active, stats.machines_maintenance, stats.machines_out], backgroundColor: [SUCCESS, WARNING, DANGER], borderWidth: 3, borderColor: '#FFFFFF' },
        ],
    }
    const doughnutOptions = { cutout: '78%', maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: chartTooltip } }
    const doughnutLegend = [
        { label: 'Actives', value: stats.machines_active, color: SUCCESS },
        { label: 'En maintenance', value: stats.machines_maintenance, color: WARNING },
        { label: 'Hors service', value: stats.machines_out, color: DANGER },
    ]

    const historyData = {
        labels: riskHistory.map((d) => d.date),
        datasets: [
            {
                label: 'Score de risque',
                data: riskHistory.map((d) => d.risk_score),
                borderColor: ACCENT,
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                fill: true,
                tension: 0.35,
                pointBackgroundColor: riskHistory.map((d) => riskColor(d.risk_score)),
                pointBorderColor: riskHistory.map((d) => riskColor(d.risk_score)),
                pointRadius: 3,
                spanGaps: true,
            },
        ],
    }

    const historyOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                ...chartTooltip,
                callbacks: {
                    label: (context) => (context.parsed.y === null ? 'Pas de données' : `Risque : ${context.parsed.y}%`),
                },
            },
        },
        scales: {
            y: { min: 0, max: 100, border: { display: false }, grid: { color: '#F1F5F9' }, ticks: { color: '#94A3B8', font: { size: 11 }, callback: (v) => v + '%' } },
            x: { border: { display: false }, grid: { display: false }, ticks: { color: '#64748B', font: { size: 11 } } },
        },
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Tableau de bord</h1>
                    <p className="text-sm text-slate-500 mt-1">Vue d'ensemble de la maintenance prédictive</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="w-48">
                        <Select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}>
                            <option value="">Toutes les localisations</option>
                            {locations.map((loc) => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </Select>
                    </div>
                    <div className="w-44">
                        <Select value={filterCriticality} onChange={(e) => setFilterCriticality(e.target.value)}>
                            <option value="">Toutes les criticités</option>
                            <option value="low">Basse</option>
                            <option value="medium">Moyenne</option>
                            <option value="high">Élevée</option>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Cartes KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {kpiCards.map((card, idx) => {
                    const Icon = card.icon
                    return (
                        <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200 transition-colors duration-150 hover:border-slate-300">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.soft }}>
                                <Icon size={18} style={{ color: card.accent }} />
                            </div>
                            <p className="text-2xl font-semibold text-slate-900 mt-4 tracking-tight">{card.value}</p>
                            <p className="text-xs font-medium text-slate-500 mt-1">{card.label}</p>
                        </div>
                    )
                })}
            </div>

            {/* Interventions + état du parc */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2 bg-white rounded-xl p-6 border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">Évolution des interventions</h3>
                    <p className="text-xs text-slate-500 mb-5">Nombre d'interventions par mois</p>
                    <div className="h-56">
                        <Bar data={barData} options={barOptions} />
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-800 mb-6">État du parc</h3>
                    <div className="relative w-full h-36">
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-semibold text-slate-900">{machineTotal}</span>
                            <span className="text-[11px] text-slate-500">machines</span>
                        </div>
                    </div>
                    <div className="mt-6 space-y-3">
                        {doughnutLegend.map((item) => (
                            <div key={item.label} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-slate-600">{item.label}</span>
                                </div>
                                <span className="font-medium text-slate-900">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Machines critiques + historique du risque */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-6 border border-slate-200 xl:col-span-1">
                    <div className="flex items-center gap-2 mb-5">
                        <AlertTriangle size={16} className="text-red-500" />
                        <h3 className="text-sm font-semibold text-slate-800">Machines critiques</h3>
                        <span className="ml-auto bg-red-50 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                            {criticalMachines.length}
                        </span>
                    </div>
                    {criticalMachines.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <CircleCheck size={22} className="text-emerald-500 mb-2" />
                            <p className="text-sm text-slate-500">Aucune machine critique</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                            {criticalMachines.map((m) => (
                                <div key={m.id} className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                    <div className="min-w-0">
                                        <p className="font-medium text-slate-800 text-sm truncate">{m.name}</p>
                                        <p className="text-xs text-slate-400 mt-0.5 truncate">{m.location} · {m.serial_number}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0 w-16">
                                        <span className="text-sm font-mono font-semibold text-red-600">{m.risk_score}%</span>
                                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${m.risk_score}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="xl:col-span-2 bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                        <div className="flex items-center gap-2">
                            <Activity size={16} className="text-blue-600" />
                            <h3 className="text-sm font-semibold text-slate-800">Évolution du risque (7 jours)</h3>
                        </div>
                        <div className="w-52">
                            <Select value={selectedMachine || ''} onChange={(e) => setSelectedMachine(Number(e.target.value))}>
                                <option value="">Sélectionner une machine</option>
                                {machines.map((m) => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </Select>
                        </div>
                    </div>
                    {!selectedMachine ? (
                        <p className="text-sm text-slate-400 text-center py-16">Sélectionnez une machine pour voir son historique</p>
                    ) : riskHistory.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-16">Aucune donnée historique disponible</p>
                    ) : (
                        <div className="h-52">
                            <Line data={historyData} options={historyOptions} />
                        </div>
                    )}
                </div>
            </div>

            {/* Alerte critique */}
            {criticalMachines.length > 0 && (
                <div className="bg-white border border-slate-200 border-l-[3px] border-l-red-500 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle size={17} className="text-red-600" />
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-slate-900 text-sm">Alerte critique</p>
                        <p className="text-slate-500 text-sm mt-0.5">
                            {criticalMachines.length} machine{criticalMachines.length > 1 ? 's ont' : ' a'} un risque de panne supérieur à 70 %.
                        </p>
                    </div>
                    <button className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-150">
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
            <div className="flex gap-2">
                <div className="h-9 w-48 bg-slate-100 rounded-lg" />
                <div className="h-9 w-44 bg-slate-100 rounded-lg" />
            </div>
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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-6 border border-slate-200 h-64" />
            <div className="xl:col-span-2 bg-white rounded-xl p-6 border border-slate-200 h-64" />
        </div>
    </div>
)

export default Dashboard