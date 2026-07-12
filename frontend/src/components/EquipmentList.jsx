import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axiosConfig'
import { Search, Plus, Filter, Eye, Edit, Trash2 } from 'lucide-react'

const EquipmentList = () => {
    const [equipments, setEquipments] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('')

    useEffect(() => {
        const fetchEquipments = async () => {
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

    const filteredEquipments = equipments.filter(eq =>
        eq.name.toLowerCase().includes(search.toLowerCase()) ||
        eq.serial_number.toLowerCase().includes(search.toLowerCase())
    )

    const getStatusBadge = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-700',
            maintenance: 'bg-yellow-100 text-yellow-700',
            out_of_service: 'bg-red-100 text-red-700',
        }
        const labels = {
            active: 'Actif',
            maintenance: 'Maintenance',
            out_of_service: 'Hors service',
        }
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        )
    }

    const getCriticalityBadge = (level) => {
        const colors = {
            low: 'bg-blue-50 text-blue-600',
            medium: 'bg-orange-50 text-orange-600',
            high: 'bg-red-50 text-red-600',
        }
        const labels = { low: 'Basse', medium: 'Moyenne', high: 'Élevée' }
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[level] || 'bg-gray-50'}`}>
                {labels[level] || level}
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

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-800">Équipements</h2>
                <Link
                    to="/equipment/new"
                    className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition shadow-sm"
                >
                    <Plus size={16} />
                    Ajouter
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-400" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                    >
                        <option value="">Tous</option>
                        <option value="active">Actif</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="out_of_service">Hors service</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50/50 text-gray-500">
                            <tr className="text-left">
                                <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Nom / Série</th>
                                <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Modèle</th>
                                <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Localisation</th>
                                <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Statut</th>
                                <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Criticité</th>
                                <th className="px-4 py-3 text-right font-medium text-xs uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredEquipments.map((eq) => (
                                <tr key={eq.id} className="hover:bg-gray-50/50 transition">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-800">{eq.name}</p>
                                        <p className="text-xs text-gray-400">{eq.serial_number}</p>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{eq.model}</td>
                                    <td className="px-4 py-3 text-gray-600">{eq.location}</td>
                                    <td className="px-4 py-3">{getStatusBadge(eq.status)}</td>
                                    <td className="px-4 py-3">{getCriticalityBadge(eq.criticality)}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button className="p-1.5 rounded hover:bg-blue-50 text-blue-500 transition">
                                                <Eye size={15} />
                                            </button>
                                            <button className="p-1.5 rounded hover:bg-yellow-50 text-yellow-500 transition">
                                                <Edit size={15} />
                                            </button>
                                            <button className="p-1.5 rounded hover:bg-red-50 text-red-500 transition">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
                    <span>{filteredEquipments.length} équipements</span>
                    <span>Mise à jour récente</span>
                </div>
            </div>
        </div>
    )
}

export default EquipmentList