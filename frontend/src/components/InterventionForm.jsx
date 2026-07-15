import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axiosConfig'
import { ArrowLeft, Wrench, AlertCircle, Loader2 } from 'lucide-react'
import { Field, SectionLabel, Select, Input, Textarea } from '../components/FormField'

const InterventionForm = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [loading, setLoading] = useState(false)
    const [initializing, setInitializing] = useState(Boolean(id))
    const [error, setError] = useState('')
    const [machines, setMachines] = useState([])
    const [users, setUsers] = useState([])
    const [formData, setFormData] = useState({
        machine: '',
        type: 'preventive',
        priority: 'medium',
        assigned_to: '',
        status: 'planned',
        planned_start: '',
        planned_end: '',
        description: '',
        report: '',
        cost: '',
        downtime_minutes: '',
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [machinesRes, usersRes] = await Promise.all([
                    api.get('/equipment/'),
                    api.get('/auth/users/'), // Assurez-vous que cet endpoint existe
                ])
                setMachines(machinesRes.data)
                setUsers(usersRes.data)
            } catch (err) {
                console.error('Erreur chargement données', err)
            }
        }
        fetchData()

        if (id) {
            const fetchIntervention = async () => {
                try {
                    const response = await api.get(`/interventions/${id}/`)
                    const data = response.data
                    setFormData({
                        ...data,
                        planned_start: data.planned_start.slice(0, 16),
                        planned_end: data.planned_end.slice(0, 16),
                    })
                } catch (err) {
                    console.error('Erreur chargement intervention', err)
                } finally {
                    setInitializing(false)
                }
            }
            fetchIntervention()
        }
    }, [id])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const url = id ? `/interventions/${id}/` : '/interventions/'
            const method = id ? 'put' : 'post'
            await api[method](url, formData)
            navigate('/interventions')
        } catch (err) {
            console.error(err)
            setError("Erreur lors de l'enregistrement.")
        } finally {
            setLoading(false)
        }
    }

    if (initializing) {
        return (
            <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 p-6 animate-pulse space-y-4">
                <div className="h-5 w-56 bg-slate-200 rounded" />
                <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-10 bg-slate-100 rounded-lg" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto">
            <button
                onClick={() => navigate('/interventions')}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors duration-150 mb-4"
            >
                <ArrowLeft size={15} />
                Retour aux interventions
            </button>

            <div className="bg-white rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Wrench size={18} className="text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">
                            {id ? "Modifier l'intervention" : 'Nouvelle intervention'}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {id ? 'Mettez à jour les informations ci-dessous.' : 'Planifiez une intervention sur une machine du parc.'}
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
                        <SectionLabel>Machine et classification</SectionLabel>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Machine" required className="md:col-span-2">
                                <Select name="machine" value={formData.machine} onChange={handleChange} required>
                                    <option value="">Sélectionner une machine</option>
                                    {machines.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.name} ({m.serial_number})
                                        </option>
                                    ))}
                                </Select>
                            </Field>
                            <Field label="Type">
                                <Select name="type" value={formData.type} onChange={handleChange}>
                                    <option value="corrective">Corrective</option>
                                    <option value="preventive">Préventive</option>
                                    <option value="predictive">Prédictive</option>
                                </Select>
                            </Field>
                            <Field label="Priorité">
                                <Select name="priority" value={formData.priority} onChange={handleChange}>
                                    <option value="low">Basse</option>
                                    <option value="medium">Moyenne</option>
                                    <option value="high">Haute</option>
                                    <option value="critical">Critique</option>
                                </Select>
                            </Field>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                        <div className="pt-4">
                            <SectionLabel>Affectation et planification</SectionLabel>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Assigné à">
                                    <Select name="assigned_to" value={formData.assigned_to} onChange={handleChange}>
                                        <option value="">Non assigné</option>
                                        {users.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.username}
                                            </option>
                                        ))}
                                    </Select>
                                </Field>
                                <Field label="Statut">
                                    <Select name="status" value={formData.status} onChange={handleChange}>
                                        <option value="planned">Planifiée</option>
                                        <option value="in_progress">En cours</option>
                                        <option value="completed">Terminée</option>
                                        <option value="cancelled">Annulée</option>
                                    </Select>
                                </Field>
                                <Field label="Début prévu" required>
                                    <Input
                                        type="datetime-local"
                                        name="planned_start"
                                        value={formData.planned_start}
                                        onChange={handleChange}
                                        required
                                    />
                                </Field>
                                <Field label="Fin prévue" required>
                                    <Input
                                        type="datetime-local"
                                        name="planned_end"
                                        value={formData.planned_end}
                                        onChange={handleChange}
                                        required
                                    />
                                </Field>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                        <div className="pt-4">
                            <SectionLabel>Coûts et compte-rendu</SectionLabel>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Coût (MAD)">
                                    <Input
                                        type="number"
                                        name="cost"
                                        value={formData.cost}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </Field>
                                <Field label="Temps d'arrêt (minutes)">
                                    <Input
                                        type="number"
                                        name="downtime_minutes"
                                        value={formData.downtime_minutes}
                                        onChange={handleChange}
                                        min="0"
                                        placeholder="0"
                                    />
                                </Field>
                                <Field label="Description" className="md:col-span-2">
                                    <Textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Nature de l'intervention, symptômes observés…"
                                    />
                                </Field>
                                <Field label="Rapport (compte-rendu)" className="md:col-span-2">
                                    <Textarea
                                        name="report"
                                        value={formData.report}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Actions réalisées, pièces remplacées…"
                                    />
                                </Field>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => navigate('/interventions')}
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
                            {loading ? 'Enregistrement…' : id ? 'Mettre à jour' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default InterventionForm