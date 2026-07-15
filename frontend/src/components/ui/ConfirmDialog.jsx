import React from 'react'
import { AlertTriangle, Loader2, X } from 'lucide-react'

// Remplace window.confirm() par une modale cohérente avec le reste de
// l'interface. Utilisation :
// <ConfirmDialog
//   open={pendingDeleteId !== null}
//   title="Supprimer l'équipement"
//   description="Cette action est définitive et ne peut pas être annulée."
//   confirmLabel="Supprimer"
//   loading={deleting}
//   onConfirm={confirmDelete}
//   onCancel={() => setPendingDeleteId(null)}
// />
const ConfirmDialog = ({
    open,
    title,
    description,
    confirmLabel = 'Confirmer',
    cancelLabel = 'Annuler',
    tone = 'danger',
    loading = false,
    onConfirm,
    onCancel,
}) => {
    if (!open) return null

    const toneStyles = {
        danger: { chip: 'bg-red-50 text-red-600', button: 'bg-red-600 hover:bg-red-700' },
        warning: { chip: 'bg-amber-50 text-amber-600', button: 'bg-amber-600 hover:bg-amber-700' },
    }
    const styles = toneStyles[tone] || toneStyles.danger

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onCancel} />
            <div className="relative bg-white rounded-xl border border-slate-200 shadow-lg w-full max-w-sm p-6">
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors duration-150"
                    aria-label="Fermer"
                >
                    <X size={16} />
                </button>

                <div className={`w-10 h-10 rounded-lg ${styles.chip} flex items-center justify-center mb-4`}>
                    <AlertTriangle size={18} />
                </div>

                <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                {description && <p className="text-sm text-slate-500 mt-1.5">{description}</p>}

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors duration-150 disabled:opacity-60"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex items-center gap-2 px-4 py-2 ${styles.button} text-white rounded-lg text-sm font-medium transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                        {loading && <Loader2 size={14} className="animate-spin" />}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDialog