import React from 'react'

// Système de badges unique pour toute l'application : chaque "tone" a un sens
// fixe (succès, alerte, danger, information, neutre) et n'est jamais choisi
// pour des raisons purement décoratives.
const TONES = {
    neutral: 'bg-slate-100 text-slate-600',
    info: 'bg-blue-50 text-blue-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
}

const Badge = ({ tone = 'neutral', children }) => (
    <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TONES[tone] || TONES.neutral}`}
    >
        {children}
    </span>
)

export const INTERVENTION_STATUS = {
    planned: { label: 'Planifiée', tone: 'neutral' },
    in_progress: { label: 'En cours', tone: 'info' },
    completed: { label: 'Terminée', tone: 'success' },
    cancelled: { label: 'Annulée', tone: 'neutral' },
}

export const INTERVENTION_PRIORITY = {
    low: { label: 'Basse', tone: 'neutral' },
    medium: { label: 'Moyenne', tone: 'warning' },
    high: { label: 'Haute', tone: 'danger' },
    critical: { label: 'Critique', tone: 'danger' },
}

export const REPORT_FORMAT = {
    pdf: { label: 'PDF', tone: 'danger' },
    excel: { label: 'EXCEL', tone: 'success' },
}

export const EQUIPMENT_STATUS = {
    active: { label: 'Actif', tone: 'success' },
    maintenance: { label: 'Maintenance', tone: 'warning' },
    out_of_service: { label: 'Hors service', tone: 'danger' },
}

export const EQUIPMENT_CRITICALITY = {
    low: { label: 'Basse', tone: 'neutral' },
    medium: { label: 'Moyenne', tone: 'warning' },
    high: { label: 'Élevée', tone: 'danger' },
}

export const ALERT_SEVERITY = {
    critical: { label: 'Critique', tone: 'danger' },
    warning: { label: 'Avertissement', tone: 'warning' },
    info: { label: 'Information', tone: 'info' },
}

export default Badge