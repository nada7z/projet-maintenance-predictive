import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
import {
    ArrowLeft,
    Package,
    AlertCircle,
    Loader2,
    ChevronDown,
} from 'lucide-react'

const STATUS_OPTIONS = [
    { value: 'active', label: 'Actif' },
    { value: 'maintenance', label: 'En maintenance' },
    { value: 'out_of_service', label: 'Hors service' },
]

const CRITICALITY_OPTIONS = [
    { value: 'low', label: 'Basse' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'high', label: 'Élevée' },
]

const fieldClass =
    'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 transition-colors duration-150 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none'

const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5'

const Field = ({ label, required, children }) => (
    <div>
        <label className={labelClass}>
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
)

const EquipmentForm = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        name: '',
        model: '',
        serial_number: '',
        location: '',
        status: 'active',
        criticality: 'medium',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            await api.post('/equipment/', formData)
            navigate('/equipment')
        } catch (err) {
            console.error(err)
            setError("Erreur lors de l'ajout de l'équipement. Vérifiez les champs.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <button
                onClick={() => navigate('/equipment')}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors duration-150 mb-4"
            >
                <ArrowLeft size={15} />
                Retour aux équipements
            </button>

            <div className="bg-white rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Package size={18} className="text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Ajouter un équipement</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Renseignez les informations de la machine pour l'enregistrer dans le parc.
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
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                            Identification
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Nom" required>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Broyeur à boulets BB-02"
                                    required
                                    className={fieldClass}
                                />
                            </Field>
                            <Field label="Modèle" required>
                                <input
                                    type="text"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                    placeholder="FLS-3200"
                                    required
                                    className={fieldClass}
                                />
                            </Field>
                            <Field label="Numéro de série" required>
                                <input
                                    type="text"
                                    name="serial_number"
                                    value={formData.serial_number}
                                    onChange={handleChange}
                                    placeholder="SN-4471-BB"
                                    required
                                    className={`${fieldClass} font-mono text-[13px]`}
                                />
                            </Field>
                            <Field label="Localisation" required>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Atelier broyage"
                                    required
                                    className={fieldClass}
                                />
                            </Field>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                            État et priorité
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Statut">
                                <div className="relative">
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className={`${fieldClass} appearance-none pr-9`}
                                    >
                                        {STATUS_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        size={15}
                                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                </div>
                            </Field>
                            <Field label="Criticité">
                                <div className="relative">
                                    <select
                                        name="criticality"
                                        value={formData.criticality}
                                        onChange={handleChange}
                                        className={`${fieldClass} appearance-none pr-9`}
                                    >
                                        {CRITICALITY_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        size={15}
                                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                </div>
                            </Field>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => navigate('/equipment')}
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
                            {loading ? 'Ajout en cours…' : "Ajouter l'équipement"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EquipmentForm