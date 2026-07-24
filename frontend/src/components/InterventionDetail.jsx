import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axiosConfig'
import {
    ArrowLeft,
    Calendar,
    Clock,
    User,
    Wrench,
    FileText,
    DollarSign,
    Clock as ClockIcon,
    CheckCircle,
    Loader2,
    Send,
    MessageSquare,
    AlertCircle,
} from 'lucide-react'
import Badge, { INTERVENTION_STATUS, INTERVENTION_PRIORITY } from './Badge'
import { Input } from './FormField'

const ROLE_LABELS = {
    admin: { label: 'Admin', avatarBg: 'bg-slate-800', badge: 'bg-slate-100 text-slate-700' },
    supervisor: { label: 'Superviseur', avatarBg: 'bg-blue-600', badge: 'bg-blue-50 text-blue-700' },
    tech: { label: 'Technicien', avatarBg: 'bg-emerald-600', badge: 'bg-emerald-50 text-emerald-700' },
}
const roleInfo = (role) => ROLE_LABELS[role] || { label: role || 'Utilisateur', avatarBg: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600' }

const InfoItem = ({ icon: Icon, label, children, iconColor = 'text-slate-400' }) => (
    <div className="flex items-start gap-2.5">
        <Icon size={17} className={`${iconColor} mt-0.5 flex-shrink-0`} />
        <div className="min-w-0">
            <p className="text-sm font-medium text-slate-700">{label}</p>
            <div className="text-sm text-slate-600">{children}</div>
        </div>
    </div>
)

const DetailSkeleton = () => (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
            <div className="h-4 w-40 bg-slate-200 rounded" />
            <div className="h-9 w-24 bg-slate-100 rounded-lg" />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="h-6 w-72 bg-slate-200 rounded mb-6" />
            <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-4 bg-slate-100 rounded" />
                ))}
            </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 h-40" />
    </div>
)

const InterventionDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [intervention, setIntervention] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState('')
    const [loadingComments, setLoadingComments] = useState(false)
    const [submittingComment, setSubmittingComment] = useState(false)

    useEffect(() => {
        const fetchIntervention = async () => {
            setLoading(true)
            setError(null)
            try {
                const response = await api.get(`/interventions/${id}/`)
                setIntervention(response.data)
            } catch (err) {
                console.error(err)
                setError("Impossible de charger les détails de l'intervention.")
            } finally {
                setLoading(false)
            }
        }
        fetchIntervention()
    }, [id])

    useEffect(() => {
        const fetchComments = async () => {
            if (!id) return
            setLoadingComments(true)
            try {
                const response = await api.get(`/interventions/${id}/comments/`)
                setComments(response.data)
            } catch (error) {
                console.error('Erreur chargement commentaires', error)
            } finally {
                setLoadingComments(false)
            }
        }
        fetchComments()
    }, [id])

    const handleAddComment = async (e) => {
        e.preventDefault()
        if (!newComment.trim()) return
        setSubmittingComment(true)
        try {
            const response = await api.post(`/interventions/${id}/comments/`, { content: newComment })
            setComments((prev) => [...prev, response.data])
            setNewComment('')
        } catch (error) {
            console.error('Erreur envoi commentaire', error)
        } finally {
            setSubmittingComment(false)
        }
    }

    if (loading) return <DetailSkeleton />

    if (error || !intervention) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl border border-slate-200 p-10 flex flex-col items-center text-center">
                    <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center mb-3">
                        <AlertCircle size={18} className="text-red-500" />
                    </div>
                    <p className="text-sm font-medium text-slate-800">{error || 'Intervention non trouvée'}</p>
                    <button
                        onClick={() => navigate('/interventions')}
                        className="mt-4 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors duration-150"
                    >
                        <ArrowLeft size={14} />
                        Retour à la liste
                    </button>
                </div>
            </div>
        )
    }

    const status = INTERVENTION_STATUS[intervention.status] || { label: intervention.status, tone: 'neutral' }
    const priority = INTERVENTION_PRIORITY[intervention.priority] || { label: intervention.priority, tone: 'neutral' }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/interventions')}
                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors duration-150"
                >
                    <ArrowLeft size={15} />
                    Retour aux interventions
                </button>
                <Link
                    to={`/interventions/${intervention.id}/edit`}
                    className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-150"
                >
                    Modifier
                </Link>
            </div>

            {/* Carte principale */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight capitalize">
                            Intervention {intervention.type}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {intervention.machine ? `Machine : ${intervention.machine}` : 'Machine non spécifiée'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge tone={priority.tone}>{priority.label}</Badge>
                        <Badge tone={status.tone}>{status.label}</Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6 pt-6 border-t border-slate-100">
                    <div className="space-y-4">
                        <InfoItem icon={Wrench} label="Type">
                            <span className="capitalize">{intervention.type}</span>
                        </InfoItem>
                        <InfoItem icon={User} label="Assigné à">
                            {intervention.assigned_to || 'Non assigné'}
                        </InfoItem>
                        <InfoItem icon={Calendar} label="Dates planifiées">
                            {new Date(intervention.planned_start).toLocaleString()} → {new Date(intervention.planned_end).toLocaleString()}
                        </InfoItem>
                    </div>
                    <div className="space-y-4">
                        <InfoItem icon={ClockIcon} label="Durée d'arrêt">
                            {intervention.downtime_minutes ? `${intervention.downtime_minutes} minutes` : 'Non renseigné'}
                        </InfoItem>
                        <InfoItem icon={DollarSign} label="Coût">
                            {intervention.cost ? `${intervention.cost} MAD` : 'Non renseigné'}
                        </InfoItem>
                        {intervention.actual_start && (
                            <InfoItem icon={CheckCircle} iconColor="text-emerald-500" label="Début réel">
                                {new Date(intervention.actual_start).toLocaleString()}
                            </InfoItem>
                        )}
                        {intervention.actual_end && (
                            <InfoItem icon={CheckCircle} iconColor="text-emerald-500" label="Fin réelle">
                                {new Date(intervention.actual_end).toLocaleString()}
                            </InfoItem>
                        )}
                    </div>
                </div>

                {intervention.description && (
                    <div className="mt-5 border-t border-slate-100 pt-5">
                        <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <FileText size={15} className="text-slate-400" />
                            Description
                        </h3>
                        <p className="text-sm text-slate-600 mt-1.5 whitespace-pre-wrap">{intervention.description}</p>
                    </div>
                )}

                {intervention.report && (
                    <div className="mt-5 border-t border-slate-100 pt-5">
                        <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <FileText size={15} className="text-slate-400" />
                            Rapport / Compte-rendu
                        </h3>
                        <p className="text-sm text-slate-600 mt-1.5 whitespace-pre-wrap">{intervention.report}</p>
                    </div>
                )}

                <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Créé le : {new Date(intervention.created_at).toLocaleString()}</span>
                    <span>Dernière modification : {new Date(intervention.updated_at).toLocaleString()}</span>
                </div>
            </div>

            {/* Discussion */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <MessageSquare size={16} className="text-blue-600" />
                    Discussion
                </h2>

                {loadingComments ? (
                    <div className="space-y-3 animate-pulse">
                        {[0, 1].map((i) => (
                            <div key={i} className="flex gap-3 p-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-1/3 bg-slate-100 rounded" />
                                    <div className="h-3 w-2/3 bg-slate-100 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : comments.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-6">
                        Aucun commentaire. Soyez le premier à intervenir.
                    </p>
                ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                        {comments.map((comment) => {
                            const role = roleInfo(comment.author_role)
                            return (
                                <div key={comment.id} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0 ${role.avatarBg}`}>
                                        {comment.author_name ? comment.author_name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium text-slate-800 text-sm">{comment.author_name}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${role.badge}`}>{role.label}</span>
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Clock size={11} />
                                                {new Date(comment.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{comment.content}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                <form onSubmit={handleAddComment} className="mt-4 flex gap-2">
                    <div className="flex-1">
                        <Input
                            type="text"
                            placeholder="Écrire un commentaire…"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submittingComment || !newComment.trim()}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                        {submittingComment ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                        Envoyer
                    </button>
                </form>
            </div>
        </div>
    )
}

export default InterventionDetail