import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
import { Plus, Edit, Trash2, Package, TrendingUp, Eye } from 'lucide-react'
import Badge, { EQUIPMENT_STATUS, EQUIPMENT_CRITICALITY } from '../components/Badge'
import { Select, SearchInput } from '../components/FormField'
import { TableSkeleton, EmptyState } from '../components/ListState'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const EquipmentList = () => {
    const [equipments, setEquipments] = useState([])
    const [riskScores, setRiskScores] = useState({}) // { machineId: score }
    const [loading, setLoading] = useState(true)
    const [loadingRisk, setLoadingRisk] = useState(false)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [pendingDelete, setPendingDelete] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const navigate = useNavigate()

    // Récupérer la liste des équipements
    useEffect(() => {
        const fetchEquipments = async () => {
            setLoading(true)
            try {
                const params = {}
                if (filterStatus) params.status = filterStatus
                const response = await api.get('/equipment/', { params })
                setEquipments(response.data)

                // Une fois les équipements chargés, récupérer les scores de risque
                if (response.data.length > 0) {
                    fetchRiskScores(response.data)
                }
            } catch (error) {
                console.error('Erreur', error)
            } finally {
                setLoading(false)
            }
        }
        fetchEquipments()
    }, [filterStatus])

    // Récupérer les scores de risque pour tous les équipements
    const fetchRiskScores = async (equipmentList) => {
        setLoadingRisk(true)
        const scores = {}
        const token = localStorage.getItem('access_token')

        // Si pas de token, on ne peut pas faire les requêtes
        if (!token) {
            console.warn('⚠️ Pas de token pour les scores de risque')
            setLoadingRisk(false)
            return
        }

        for (const eq of equipmentList) {
            try {
                const response = await api.get(`/risk/${eq.id}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                if (response.data && response.data.risk_score !== undefined && response.data.risk_score !== null) {
                    scores[eq.id] = response.data.risk_score
                } else {
                    scores[eq.id] = null
                }
            } catch (error) {
                console.error(`❌ Erreur pour ${eq.name}:`, error.response?.status, error.response?.data)
                scores[eq.id] = null
            }
        }
        setRiskScores(scores)
        setLoadingRisk(false)
    }

    const confirmDelete = async () => {
        if (!pendingDelete) return
        setDeleting(true)
        try {
            await api.delete(`/equipment/${pendingDelete.id}/`)
            setEquipments((prev) => prev.filter((eq) => eq.id !== pendingDelete.id))
            // Supprimer aussi le score du cache
            setRiskScores((prev) => {
                const newScores = { ...prev }
                delete newScores[pendingDelete.id]
                return newScores
            })
            setPendingDelete(null)
        } catch (error) {
            console.error('Erreur lors de la suppression', error)
        } finally {
            setDeleting(false)
        }
    }

    const filteredEquipments = equipments.filter(
        (eq) =>
            eq.name.toLowerCase().includes(search.toLowerCase()) ||
            eq.serial_number.toLowerCase().includes(search.toLowerCase())
    )

    // Fonction pour obtenir la couleur de la jauge en fonction du score
    const getRiskColor = (score) => {
        if (score === null || score === undefined) return 'bg-gray-200'
        if (score > 70) return 'bg-red-500'
        if (score > 40) return 'bg-orange-500'
        return 'bg-green-500'
    }

    // Fonction pour obtenir la teinte du texte
    const getRiskTextColor = (score) => {
        if (score === null || score === undefined) return 'text-gray-400'
        if (score > 70) return 'text-red-600'
        if (score > 40) return 'text-orange-600'
        return 'text-green-600'
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Équipements</h2>
                    <p className="text-sm text-slate-500 mt-0.5">{equipments.length} machines enregistrées dans le parc</p>
                </div>
                <Link
                    to="/equipment/new"
                    className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-150"
                >
                    <Plus size={16} />
                    Ajouter un équipement
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <SearchInput
                        placeholder="Rechercher par nom ou numéro de série…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="sm:w-52">
                    <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="">Tous les statuts</option>
                        <option value="active">Actif</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="out_of_service">Hors service</option>
                    </Select>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr className="text-left">
                                <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wide">Nom / Série</th>
                                <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wide">Modèle</th>
                                <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wide">Localisation</th>
                                <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wide">Statut</th>
                                <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wide">Criticité</th>
                                <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wide">Risque</th>
                                <th className="px-4 py-3 text-right font-medium text-[11px] uppercase tracking-wide">Actions</th>
                            </tr>
                        </thead>
                        {!loading && (
                            <tbody className="divide-y divide-slate-100">
                                {filteredEquipments.map((eq) => {
                                    const status = EQUIPMENT_STATUS[eq.status] || { label: eq.status, tone: 'neutral' }
                                    const criticality = EQUIPMENT_CRITICALITY[eq.criticality] || { label: eq.criticality, tone: 'neutral' }
                                    const riskScore = riskScores[eq.id]
                                    const isRiskLoading = loadingRisk && riskScore === undefined
                                    const riskColor = getRiskColor(riskScore)
                                    const riskTextColor = getRiskTextColor(riskScore)

                                    return (
                                        <tr key={eq.id} className="hover:bg-slate-50 transition-colors duration-150">
                                            <td className="px-4 py-3.5">
                                                <p className="font-medium text-slate-800">{eq.name}</p>
                                                <p className="text-xs text-slate-400 font-mono mt-0.5">{eq.serial_number}</p>
                                            </td>
                                            <td className="px-4 py-3.5 text-slate-600">{eq.model}</td>
                                            <td className="px-4 py-3.5 text-slate-600">{eq.location}</td>
                                            <td className="px-4 py-3.5"><Badge tone={status.tone}>{status.label}</Badge></td>
                                            <td className="px-4 py-3.5"><Badge tone={criticality.tone}>{criticality.label}</Badge></td>
                                            <td className="px-4 py-3.5">
                                                {isRiskLoading ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 bg-slate-200 rounded-full animate-pulse"></div>
                                                        <span className="text-xs text-slate-400">…</span>
                                                    </div>
                                                ) : riskScore !== null && riskScore !== undefined ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${riskColor}`}
                                                                style={{ width: `${Math.min(riskScore, 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className={`text-xs font-medium ${riskTextColor}`}>
                                                            {Math.round(riskScore)}%
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link
                                                        to={`/equipment/${eq.id}`}
                                                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors duration-150"
                                                        title="Voir les détails"
                                                    >
                                                        <Eye size={15} />
                                                    </Link>
                                                    <button
                                                        onClick={() => navigate(`/equipment/edit/${eq.id}`)}
                                                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors duration-150"
                                                        title="Modifier"
                                                    >
                                                        <Edit size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => setPendingDelete(eq)}
                                                        className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors duration-150"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        )}
                    </table>
                    {loading && <TableSkeleton columns={7} rows={5} />}
                    {!loading && filteredEquipments.length === 0 && (
                        <EmptyState
                            icon={Package}
                            title={search ? 'Aucun résultat' : 'Aucun équipement'}
                            description={
                                search
                                    ? `Aucune machine ne correspond à « ${search} ».`
                                    : 'Ajoutez votre première machine pour commencer le suivi.'
                            }
                        />
                    )}
                </div>
                {!loading && filteredEquipments.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
                        <span>{filteredEquipments.length} équipement{filteredEquipments.length > 1 ? 's' : ''}</span>
                        {Object.values(riskScores).some(s => s !== null && s > 70) && (
                            <span className="flex items-center gap-1 text-red-500">
                                <TrendingUp size={12} />
                                Alertes critiques actives
                            </span>
                        )}
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={pendingDelete !== null}
                title="Supprimer cet équipement ?"
                description={
                    pendingDelete
                        ? `« ${pendingDelete.name} » (${pendingDelete.serial_number}) sera définitivement supprimé, ainsi que son historique associé.`
                        : ''
                }
                confirmLabel="Supprimer"
                loading={deleting}
                onConfirm={confirmDelete}
                onCancel={() => setPendingDelete(null)}
            />
        </div>
    )
}

export default EquipmentList