import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axiosConfig'
import {
    ArrowLeft,
    Download,
    Calendar,
    AlertCircle,
    Wrench,
    Bell,
    Package,
    MapPin,
    QrCode,
    Activity,
    PlusCircle,
    X,
} from 'lucide-react'
import Badge, {
    EQUIPMENT_STATUS,
    EQUIPMENT_CRITICALITY,
    INTERVENTION_STATUS,
    INTERVENTION_PRIORITY,
    ALERT_SEVERITY,
} from './Badge'

// Importation de Chart.js
import { Line } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

const InfoRow = ({ icon: Icon, label, children }) => (
    <div className="flex items-center gap-2">
        {Icon && <Icon size={15} className="text-slate-400 flex-shrink-0" />}
        <span className="text-slate-500">{label} :</span>
        {children}
    </div>
)

const DetailSkeleton = () => (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
            <div className="h-4 w-40 bg-slate-200 rounded" />
            <div className="h-9 w-24 bg-slate-100 rounded-lg" />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="h-6 w-64 bg-slate-200 rounded mb-4" />
            <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-4 bg-slate-100 rounded" />
                ))}
            </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 h-32" />
        <div className="bg-white rounded-xl border border-slate-200 p-6 h-32" />
        <div className="bg-white rounded-xl border border-slate-200 p-6 h-32" />
    </div>
)

const EquipmentDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [equipment, setEquipment] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // États pour les données capteurs
    const [sensorData, setSensorData] = useState(null)
    const [loadingSensor, setLoadingSensor] = useState(false)

    // Modal state
    const [showModal, setShowModal] = useState(false)
    const [newSensor, setNewSensor] = useState({
        temperature: '',
        vibration: '',
        operating_hours: '',
        consumption: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')

    // Récupération de l'équipement
    useEffect(() => {
        const fetchEquipment = async () => {
            setLoading(true)
            setError(null)
            try {
                const response = await api.get(`/equipment/${id}/`)
                setEquipment(response.data)
            } catch (err) {
                console.error(err)
                setError("Impossible de charger les détails de l'équipement.")
            } finally {
                setLoading(false)
            }
        }
        fetchEquipment()
    }, [id])

    // Fonction de récupération des données capteurs
    const fetchSensorData = async () => {
        setLoadingSensor(true)
        try {
            const response = await api.get(`/sensor-data/${id}/`)
            let data = response.data

            if (!Array.isArray(data)) {
                data = [data]
            } else if (data.results && Array.isArray(data.results)) {
                data = data.results
            }

            setSensorData(data)
        } catch (error) {
            console.error('Erreur chargement données capteurs', error)
        } finally {
            setLoadingSensor(false)
        }
    }

    useEffect(() => {
        fetchSensorData()
    }, [id])

    const handleDownloadQR = () => {
        if (equipment?.qr_code_url) {
            window.open(equipment.qr_code_url, '_blank')
        }
    }

    // ---- Gestion du modal d'ajout de mesure ----
    const handleAddSensor = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setSubmitError('')

        if (!newSensor.temperature || !newSensor.vibration) {
            setSubmitError('Température et vibrations sont obligatoires.')
            setSubmitting(false)
            return
        }

        const payload = {
            machine: parseInt(id),
            temperature: parseFloat(newSensor.temperature),
            vibration: parseFloat(newSensor.vibration),
            operating_hours: parseFloat(newSensor.operating_hours) || 0,
            consumption: parseFloat(newSensor.consumption) || 0,
        }

        try {
            await api.post('/sensor-data/', payload)
            setShowModal(false)
            setNewSensor({ temperature: '', vibration: '', operating_hours: '', consumption: '' })
            await fetchSensorData()
            // Rafraîchir l'équipement pour mettre à jour le score de risque (s'il est affiché)
            const eqRes = await api.get(`/equipment/${id}/`)
            setEquipment(eqRes.data)
        } catch (err) {
            console.error(err)
            setSubmitError('Erreur lors de l\'ajout de la mesure. Vérifiez les champs.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleModalChange = (e) => {
        const { name, value } = e.target
        setNewSensor((prev) => ({ ...prev, [name]: value }))
    }

    // ---- Graphique ----
    const getChartData = () => {
        if (!sensorData || !Array.isArray(sensorData) || sensorData.length === 0) return null

        const data = sensorData.slice(0, 24).reverse()
        const labels = data.map(d => new Date(d.timestamp).toLocaleTimeString())

        return {
            labels,
            datasets: [
                {
                    label: 'Température (°C)',
                    data: data.map(d => d.temperature),
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y',
                },
                {
                    label: 'Vibrations (mm/s)',
                    data: data.map(d => d.vibration),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1',
                },
            ],
        }
    }

    const chartData = getChartData()

    const chartOptions = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || ''
                        let value = context.parsed.y
                        if (context.dataset.label.includes('Température')) {
                            label += `: ${value.toFixed(1)} °C`
                        } else if (context.dataset.label.includes('Vibrations')) {
                            label += `: ${value.toFixed(2)} mm/s`
                        }
                        return label
                    },
                },
            },
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Température (°C)',
                    color: 'rgb(239, 68, 68)',
                },
                grid: {
                    drawOnChartArea: false,
                },
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Vibrations (mm/s)',
                    color: 'rgb(59, 130, 246)',
                },
                grid: {
                    drawOnChartArea: false,
                },
            },
        },
    }

    if (loading) return <DetailSkeleton />

    if (error || !equipment) {
        return (
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-xl border border-slate-200 p-10 flex flex-col items-center text-center">
                    <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center mb-3">
                        <AlertCircle size={18} className="text-red-500" />
                    </div>
                    <p className="text-sm font-medium text-slate-800">{error || 'Équipement non trouvé'}</p>
                    <button
                        onClick={() => navigate('/equipment')}
                        className="mt-4 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors duration-150"
                    >
                        <ArrowLeft size={14} />
                        Retour à la liste
                    </button>
                </div>
            </div>
        )
    }

    const status = EQUIPMENT_STATUS[equipment.status] || { label: equipment.status, tone: 'neutral' }
    const criticality = EQUIPMENT_CRITICALITY[equipment.criticality] || { label: equipment.criticality, tone: 'neutral' }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* En-tête avec retour et bouton modifier */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/equipment')}
                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors duration-150"
                >
                    <ArrowLeft size={15} />
                    Retour aux équipements
                </button>
                <Link
                    to={`/equipment/edit/${equipment.id}`}
                    className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-150"
                >
                    Modifier
                </Link>
            </div>

            {/* Carte d'identité de la machine */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1 space-y-4">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{equipment.name}</h1>
                            <p className="text-sm text-slate-400 font-mono mt-1">{equipment.serial_number}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                            <InfoRow icon={Package} label="Modèle">
                                <span className="font-medium text-slate-700">{equipment.model}</span>
                            </InfoRow>
                            <InfoRow icon={MapPin} label="Localisation">
                                <span className="font-medium text-slate-700">{equipment.location}</span>
                            </InfoRow>
                            <InfoRow label="Statut">
                                <Badge tone={status.tone}>{status.label}</Badge>
                            </InfoRow>
                            <InfoRow label="Criticité">
                                <Badge tone={criticality.tone}>{criticality.label}</Badge>
                            </InfoRow>
                            <InfoRow icon={Calendar} label="Ajouté le">
                                <span className="text-slate-700">
                                    {new Date(equipment.created_at).toLocaleDateString()}
                                </span>
                            </InfoRow>
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6 min-w-[120px]">
                        {equipment.qr_code_url ? (
                            <>
                                <div className="p-2 bg-white border border-slate-200 rounded-lg">
                                    <img src={equipment.qr_code_url} alt="QR Code" className="w-20 h-20 object-contain" />
                                </div>
                                <button
                                    onClick={handleDownloadQR}
                                    className="mt-3 flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors duration-150"
                                >
                                    <Download size={13} />
                                    Télécharger
                                </button>
                            </>
                        ) : (
                            <div className="w-24 h-24 rounded-lg bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                                <QrCode size={22} />
                                <span className="text-[11px] mt-1.5 text-center px-2">Non généré</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Graphique des données capteurs avec bouton d'ajout */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <Activity size={16} className="text-blue-600" />
                        Évolution des capteurs (dernières 24h)
                    </h2>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-1.5 text-sm font-medium bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors duration-150"
                    >
                        <PlusCircle size={15} />
                        Ajouter une mesure
                    </button>
                </div>
                {loadingSensor ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : chartData && chartData.labels && chartData.labels.length > 0 ? (
                    <div className="h-64">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                ) : (
                    <p className="text-slate-400 text-sm">Aucune donnée capteur disponible.</p>
                )}
            </div>

            {/* Historique des interventions */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <Wrench size={16} className="text-blue-600" />
                    Historique des interventions
                </h2>
                {equipment.interventions && equipment.interventions.length > 0 ? (
                    <div className="space-y-0 divide-y divide-slate-100">
                        {equipment.interventions.map((inv) => {
                            const priority = INTERVENTION_PRIORITY[inv.priority] || { label: inv.priority, tone: 'neutral' }
                            const invStatus = INTERVENTION_STATUS[inv.status] || { label: inv.status, tone: 'neutral' }
                            return (
                                <div key={inv.id} className="py-3 first:pt-0 last:pb-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="font-medium text-slate-800 capitalize">{inv.type}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {new Date(inv.planned_start).toLocaleDateString()} — {invStatus.label}
                                            </p>
                                            {inv.description && (
                                                <p className="text-sm text-slate-600 mt-1.5">{inv.description}</p>
                                            )}
                                            {inv.assigned_to_name && (
                                                <p className="text-xs text-slate-400 mt-1.5">
                                                    Assigné à : {inv.assigned_to_name}
                                                </p>
                                            )}
                                        </div>
                                        <Badge tone={priority.tone}>{priority.label}</Badge>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <p className="text-slate-400 text-sm">Aucune intervention enregistrée.</p>
                )}
            </div>

            {/* Alertes */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <Bell size={16} className="text-red-600" />
                    Alertes
                </h2>
                {equipment.alerts && equipment.alerts.length > 0 ? (
                    <div className="space-y-0 divide-y divide-slate-100">
                        {equipment.alerts.map((alert) => {
                            const severity = ALERT_SEVERITY[alert.severity] || { label: alert.severity, tone: 'neutral' }
                            return (
                                <div key={alert.id} className="py-3 first:pt-0 last:pb-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-slate-800">{alert.type}</p>
                                                {!alert.is_read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                                            </div>
                                            <p className="text-sm text-slate-600 mt-0.5">{alert.message}</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {new Date(alert.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <Badge tone={severity.tone}>{severity.label}</Badge>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <p className="text-slate-400 text-sm">Aucune alerte.</p>
                )}
            </div>

            {/* ---- Modal Ajouter une mesure ---- */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-900">Ajouter une mesure</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 rounded-md hover:bg-slate-100 transition-colors duration-150"
                            >
                                <X size={18} className="text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleAddSensor}>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Température (°C) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="temperature"
                                        value={newSensor.temperature}
                                        onChange={handleModalChange}
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                        placeholder="Ex: 75.5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Vibrations (mm/s) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="vibration"
                                        value={newSensor.vibration}
                                        onChange={handleModalChange}
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                        placeholder="Ex: 0.45"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Heures de fonctionnement (h)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="operating_hours"
                                        value={newSensor.operating_hours}
                                        onChange={handleModalChange}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                        placeholder="Ex: 1520"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Consommation (kWh)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="consumption"
                                        value={newSensor.consumption}
                                        onChange={handleModalChange}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                        placeholder="Ex: 45.2"
                                    />
                                </div>
                                {submitError && (
                                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{submitError}</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors duration-150"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-150 disabled:opacity-60"
                                >
                                    {submitting ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Envoi...
                                        </>
                                    ) : (
                                        'Ajouter'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default EquipmentDetail