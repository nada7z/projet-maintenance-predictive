import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axiosConfig'
import { FileText, Download, Plus } from 'lucide-react'
import Badge, { REPORT_FORMAT } from '../components/Badge'
import { TableSkeleton, EmptyState } from '../components/ListState'

const ReportsList = () => {
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await api.get('/reports/')
                setReports(response.data)
            } catch (error) {
                console.error('Erreur', error)
            } finally {
                setLoading(false)
            }
        }
        fetchReports()
    }, [])

    const handleDownload = (report) => {
        window.open(report.file, '_blank')
    }

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
                                <th className="px-4 py-3 text-right font-medium text-[11px] uppercase tracking-wide">Action</th>
                            </tr>
                        </thead>
                        {!loading && (
                            <tbody className="divide-y divide-slate-100">
                                {reports.map((report) => {
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
                                            <td className="px-4 py-3.5 text-slate-600">{report.generated_by?.username || 'N/A'}</td>
                                            <td className="px-4 py-3.5 text-xs text-slate-500">
                                                {new Date(report.generated_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <button
                                                    onClick={() => handleDownload(report)}
                                                    className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors duration-150"
                                                >
                                                    <Download size={13} />
                                                    Télécharger
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        )}
                    </table>
                    {loading && <TableSkeleton columns={6} rows={5} />}
                    {!loading && reports.length === 0 && (
                        <EmptyState
                            icon={FileText}
                            title="Aucun rapport généré"
                            description="Les rapports PDF et Excel générés apparaîtront ici une fois prêts."
                        />
                    )}
                </div>
                {!loading && reports.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-slate-100 text-xs text-slate-400">
                        {reports.length} rapport{reports.length > 1 ? 's' : ''}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ReportsList