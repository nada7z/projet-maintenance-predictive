import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axiosConfig'
import { FileText, Download, Plus, Trash2, Search } from 'lucide-react'
import Badge, { REPORT_FORMAT } from '../components/Badge'
import { TableSkeleton, EmptyState } from '../components/ListState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { Select, SearchInput } from '../components/FormField'

const ReportsList = () => {
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [pendingDelete, setPendingDelete] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [search, setSearch] = useState('')
    const [filterType, setFilterType] = useState('')

    const fetchReports = async () => {
        setLoading(true)
        try {
            const response = await api.get('/reports/')
            setReports(response.data)
        } catch (error) {
            console.error('Erreur', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReports()
    }, [])

    const handleDownload = (report) => {
        const fileUrl = report.file.startsWith('http') ? report.file : `http://127.0.0.1:8000${report.file}`
        window.open(fileUrl, '_blank')
    }

    const confirmDelete = async () => {
        if (!pendingDelete) return
        setDeleting(true)
        try {
            await api.delete(`/reports/${pendingDelete.id}/`)
            setReports((prev) => prev.filter((r) => r.id !== pendingDelete.id))
            setPendingDelete(null)
        } catch (error) {
            console.error('Erreur lors de la suppression', error)
        } finally {
            setDeleting(false)
        }
    }

    // Filtrage et recherche
    const filteredReports = useMemo(() => {
        let result = reports

        // Filtre par type
        if (filterType) {
            result = result.filter((r) => r.type === filterType)
        }

        // Recherche par titre
        if (search) {
            const q = search.toLowerCase()
            result = result.filter((r) =>
                r.title.toLowerCase().includes(q)
            )
        }

        return result
    }, [reports, filterType, search])

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Rapports</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Rapports générés en tâche de fond, prêts au téléchargement</p>
                </div>
                <Link
                    to="/reports/new"
                    className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-150"
                >
                    <Plus size={16} />
                    Générer un rapport
                </Link>
            </div>

            {/* Barre de recherche et filtre */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <SearchInput
                        placeholder="Rechercher par titre..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="sm:w-52">
                    <Select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="">Tous les types</option>
                        <option value="monthly">Mensuel</option>
                        <option value="annual">Annuel</option>
                        <option value="custom">Personnalisé</option>
                    </Select>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr className="text-left">
                                <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wide">Titre</th>
                                <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wide">Type</th>
                                <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wide">Format</th>
                                <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wide">Généré par</th>
                                <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wide">Date</th>
                                <th className="px-4 py-3 text-right font-medium text-[11px] uppercase tracking-wide">Actions</th>
                            </tr>
                        </thead>
                        {!loading && (
                            <tbody className="divide-y divide-slate-100">
                                {filteredReports.map((report) => {
                                    const format = REPORT_FORMAT[report.format] || { label: report.format?.toUpperCase(), tone: 'neutral' }
                                    return (
                                        <tr key={report.id} className="hover:bg-slate-50 transition-colors duration-150">
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <FileText size={15} className="text-slate-400 flex-shrink-0" />
                                                    <span className="font-medium text-slate-800">{report.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-slate-600 capitalize">{report.type}</td>
                                            <td className="px-4 py-3.5"><Badge tone={format.tone}>{format.label}</Badge></td>
                                            <td className="px-4 py-3.5 text-slate-600">
                                                {report.generated_by?.username
                                                    ? `${report.generated_by.first_name || ''} ${report.generated_by.last_name || ''}`.trim() || report.generated_by.username
                                                    : 'N/A'}
                                            </td>
                                            <td className="px-4 py-3.5 text-xs text-slate-500">
                                                {new Date(report.generated_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => handleDownload(report)}
                                                        className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors duration-150"
                                                    >
                                                        <Download size={13} />
                                                        Télécharger
                                                    </button>
                                                    <button
                                                        onClick={() => setPendingDelete(report)}
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
                    {!loading && filteredReports.length === 0 && (
                        <EmptyState
                            icon={FileText}
                            title={search || filterType ? 'Aucun résultat' : 'Aucun rapport généré'}
                            description={
                                search || filterType
                                    ? `Aucun rapport ne correspond à vos critères.`
                                    : 'Les rapports PDF et Excel générés apparaîtront ici une fois prêts.'
                            }
                        />
                    )}
                </div>
                {!loading && filteredReports.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-slate-100 text-xs text-slate-400">
                        {filteredReports.length} rapport{filteredReports.length > 1 ? 's' : ''}
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={pendingDelete !== null}
                title="Supprimer ce rapport ?"
                description={
                    pendingDelete
                        ? `Le rapport « ${pendingDelete.title} » sera définitivement supprimé.`
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

export default ReportsList