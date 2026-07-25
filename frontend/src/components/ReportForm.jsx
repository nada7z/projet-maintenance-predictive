import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
import { ArrowLeft, FileText, AlertCircle, Loader2 } from 'lucide-react'
import { Field, SectionLabel, Select, Input } from '../components/FormField'

const ReportForm = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [machines, setMachines] = useState([])
    const [formData, setFormData] = useState({
        type: 'monthly',
        format: 'pdf',
        filters: {
            date_from: '',
            date_to: '',
            machine: '',
        },
    })

    // Charger la liste des machines pour le filtre
    useEffect(() => {
        const fetchMachines = async () => {
            try {
                const response = await api.get('/equipment/')
                setMachines(response.data)
            } catch (err) {
                console.error('Erreur chargement machines', err)
            }
        }
        fetchMachines()
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            filters: { ...prev.filters, [name]: value },
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            await api.post('/reports/generate/', formData)
            navigate('/reports')
        } catch (err) {
            console.error(err)
            setError('Erreur lors de la génération du rapport.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <button
                onClick={() => navigate('/reports')}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors duration-150 mb-4"
            >
                <ArrowLeft size={15} />
                Retour aux rapports
            </button>

            <div className="bg-white rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FileText size={18} className="text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Générer un rapport</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Le rapport est généré en tâche de fond et apparaîtra dans la liste une fois prêt.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mx-6 mt-5 flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
                    <div>
                        <SectionLabel>Paramètres du rapport</SectionLabel>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Type de rapport" required>
                                <Select name="type" value={formData.type} onChange={handleChange} required>
                                    <option value="monthly">Mensuel</option>
                                    <option value="annual">Annuel</option>
                                    <option value="custom">Personnalisé</option>
                                </Select>
                            </Field>
                            <Field label="Format" required>
                                <Select name="format" value={formData.format} onChange={handleChange} required>
                                    <option value="pdf">PDF</option>
                                    <option value="excel">Excel</option>
                                </Select>
                            </Field>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                        <div className="pt-4">
                            <SectionLabel>Filtres (optionnels)</SectionLabel>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Date de début">
                                    <Input
                                        type="date"
                                        name="date_from"
                                        value={formData.filters.date_from}
                                        onChange={handleFilterChange}
                                    />
                                </Field>
                                <Field label="Date de fin">
                                    <Input
                                        type="date"
                                        name="date_to"
                                        value={formData.filters.date_to}
                                        onChange={handleFilterChange}
                                    />
                                </Field>
                                <Field label="Machine" className="md:col-span-2" hint="Laisser vide pour inclure toutes les machines">
                                    <Select
                                        name="machine"
                                        value={formData.filters.machine}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">Toutes les machines</option>
                                        {machines.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.name} ({m.serial_number})
                                            </option>
                                        ))}
                                    </Select>
                                </Field>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => navigate('/reports')}
                            className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors duration-150"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 size={15} className="animate-spin" />}
                            {loading ? 'Génération…' : 'Générer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ReportForm