import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axiosConfig'
import { Plus, Eye, Edit, Trash2, Package } from 'lucide-react'
import Badge, { EQUIPMENT_STATUS, EQUIPMENT_CRITICALITY } from '../components/Badge'
import { Select, SearchInput } from '../components/FormField'
import { TableSkeleton, EmptyState } from '../components/ListState'

const EquipmentList = () => {
    const [equipments, setEquipments] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('')

    useEffect(() => {
        const fetchEquipments = async () => {
            setLoading(true)
            try {
                const params = {}
                if (filterStatus) params.status = filterStatus
                const response = await api.get('/equipment/', { params })
                setEquipments(response.data)
            } catch (error) {
                console.error('Erreur', error)
            } finally {
                setLoading(false)
            }
        }
        fetchEquipments()
    }, [filterStatus])

    const filteredEquipments = equipments.filter(
        (eq) =>
            eq.name.toLowerCase().includes(search.toLowerCase()) ||
            eq.serial_number.toLowerCase().includes(search.toLowerCase())
    )

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
                                <th className="px-4 py-3 text-right font-medium text-[11px] uppercase tracking-wide">Actions</th>
                            </tr>
                        </thead>
                        {!loading && (
                            <tbody className="divide-y divide-slate-100">
                                {filteredEquipments.map((eq) => {
                                    const status = EQUIPMENT_STATUS[eq.status] || { label: eq.status, tone: 'neutral' }
                                    const criticality = EQUIPMENT_CRITICALITY[eq.criticality] || { label: eq.criticality, tone: 'neutral' }
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
                                            <td className="px-4 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors duration-150" aria-label="Voir">
                                                        <Eye size={15} />
                                                    </button>
                                                    <Link to={`/equipment/${eq.id}/edit`} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors duration-150" aria-label="Modifier">
                                                        <Edit size={15} />
                                                    </Link>
                                                    <button className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors duration-150" aria-label="Supprimer">
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
                    {loading && <TableSkeleton columns={6} rows={5} />}
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
                    </div>
                )}
            </div>
        </div>
    )
}

export default EquipmentList