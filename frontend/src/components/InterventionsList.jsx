import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
import { Plus, Eye, Edit, Trash2, Wrench } from 'lucide-react'
import Badge, { INTERVENTION_STATUS, INTERVENTION_PRIORITY } from '../components/Badge'
import { Select, SearchInput } from '../components/FormField'
import { TableSkeleton, EmptyState } from '../components/ListState'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const InterventionsList = () => {
    const [interventions, setInterventions] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('')
    const [search, setSearch] = useState('')
    const [pendingDelete, setPendingDelete] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchInterventions = async () => {
            setLoading(true)
            try {
                const params = {}
                if (filter) params.status = filter
                const response = await api.get('/interventions/', { params })
                setInterventions(response.data)
            } catch (error) {
                console.error('Erreur', error)
            } finally {
                setLoading(false)
            }
        }
        fetchInterventions()
    }, [filter])

    const confirmDelete = async () => {
        if (!pendingDelete) return
        setDeleting(true)
        try {
            await api.delete(`/interventions/${pendingDelete.id}/`)
            setInterventions((prev) => prev.filter((inv) => inv.id !== pendingDelete.id))
            setPendingDelete(null)
        } catch (error) {
            console.error('Erreur lors de la suppression', error)
        } finally {
            setDeleting(false)
        }
    }

    const filteredInterventions = useMemo(() => {
        if (!search) return interventions
        const q = search.toLowerCase()
        return interventions.filter(
            (inv) =>
                (inv.machine || '').toLowerCase().includes(q) ||
                (inv.type || '').toLowerCase().includes(q) ||
                (inv.assigned_to || '').toLowerCase().includes(q)
        )
    }, [interventions, search])

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Interventions</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Planification et suivi des interventions de maintenance</p>
                </div>
                <Link
                    to="/interventions/new"
                    className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-150"
                >
                    <Plus size={16} />
                    Nouvelle intervention
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <SearchInput
                        placeholder="Rechercher par machine, type ou technicien…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="sm:w-56">
                    <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="">Tous les statuts</option>
                        <option value="planned">Planifiée</option>
                        <option value="in_progress">En cours</option>
                        <option value="completed">Terminée</option>
                        <option value="cancelled">Annulée</option>
                    </Select>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr className="text-left">
                                <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wide">Machine / Type</th>
                                <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wide">Priorité</th>
                                <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wide">Assigné à</th>
                                <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wide">Dates</th>
                                <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wide">Statut</th>
                                <th className="px-4 py-3 text-right font-medium text-[11px] uppercase tracking-wide">Actions</th>
                            </tr>
                        </thead>
                        {!loading && (
                            <tbody className="divide-y divide-slate-100">
                                {filteredInterventions.map((inv) => {
                                    const status = INTERVENTION_STATUS[inv.status] || { label: inv.status, tone: 'neutral' }
                                    const priority = INTERVENTION_PRIORITY[inv.priority] || { label: inv.priority, tone: 'neutral' }
                                    return (
                                        <tr key={inv.id} className="hover:bg-slate-50 transition-colors duration-150">
                                            <td className="px-4 py-3.5">
                                                <p className="font-medium text-slate-800">{inv.machine || 'N/A'}</p>
                                                <p className="text-xs text-slate-400 mt-0.5 capitalize">{inv.type}</p>
                                            </td>
                                            <td className="px-4 py-3.5"><Badge tone={priority.tone}>{priority.label}</Badge></td>
                                            <td className="px-4 py-3.5 text-slate-600">{inv.assigned_to || 'Non assigné'}</td>
                                            <td className="px-4 py-3.5 text-xs">
                                                <div className="text-slate-700">{new Date(inv.planned_start).toLocaleDateString()}</div>
                                                <div className="text-slate-400 mt-0.5">{new Date(inv.planned_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td className="px-4 py-3.5"><Badge tone={status.tone}>{status.label}</Badge></td>
                                            <td className="px-4 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => navigate(`/interventions/${inv.id}`)}
                                                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors duration-150"
                                                        aria-label="Voir"
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                    <Link to={`/interventions/${inv.id}/edit`} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors duration-150" aria-label="Modifier">
                                                        <Edit size={15} />
                                                    </Link>
                                                    <button
                                                        onClick={() => setPendingDelete(inv)}
                                                        className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors duration-150"
                                                        aria-label="Supprimer"
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
                    {loading && <TableSkeleton columns={6} rows={5} />}
                    {!loading && filteredInterventions.length === 0 && (
                        <EmptyState
                            icon={Wrench}
                            title={search ? 'Aucun résultat' : 'Aucune intervention'}
                            description={
                                search
                                    ? `Aucune intervention ne correspond à « ${search} ».`
                                    : 'Les interventions planifiées ou en cours apparaîtront ici.'
                            }
                        />
                    )}
                </div>
                {!loading && filteredInterventions.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-slate-100 text-xs text-slate-400">
                        {filteredInterventions.length} intervention{filteredInterventions.length > 1 ? 's' : ''}
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={pendingDelete !== null}
                title="Supprimer cette intervention ?"
                description={
                    pendingDelete
                        ? `L'intervention sur « ${pendingDelete.machine || 'cette machine'} » sera définitivement supprimée.`
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

export default InterventionsList