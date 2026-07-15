import React from 'react'

export const TableSkeleton = ({ columns = 5, rows = 5 }) => (
    <div className="animate-pulse">
        {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex items-center gap-6 px-4 py-4 border-b border-slate-100 last:border-0">
                {Array.from({ length: columns }).map((_, c) => (
                    <div key={c} className="h-3.5 bg-slate-100 rounded flex-1" />
                ))}
            </div>
        ))}
    </div>
)

export const ListSkeleton = ({ rows = 5 }) => (
    <div className="animate-pulse divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex items-start gap-4 p-4">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-1/3 bg-slate-100 rounded" />
                    <div className="h-3 w-2/3 bg-slate-100 rounded" />
                </div>
            </div>
        ))}
    </div>
)

export const EmptyState = ({ icon: Icon, title, description }) => (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
        {Icon && (
            <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <Icon size={18} className="text-slate-400" />
            </div>
        )}
        <p className="text-sm font-medium text-slate-700">{title}</p>
        {description && <p className="text-xs text-slate-400 mt-1 max-w-xs">{description}</p>}
    </div>
)
