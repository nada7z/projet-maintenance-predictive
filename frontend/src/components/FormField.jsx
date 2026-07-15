import React from 'react'
import { ChevronDown, Search } from 'lucide-react'

export const fieldClass =
    'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 transition-colors duration-150 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400'

export const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5'

export const SectionLabel = ({ children }) => (
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">{children}</p>
)

export const Field = ({ label, required, hint, className = '', children }) => (
    <div className={className}>
        {label && (
            <label className={labelClass}>
                {label} {required && <span className="text-red-500">*</span>}
            </label>
        )}
        {children}
        {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
)

export const Input = (props) => <input {...props} className={`${fieldClass} ${props.className || ''}`} />

export const Textarea = (props) => (
    <textarea {...props} className={`${fieldClass} resize-none ${props.className || ''}`} />
)

export const SearchInput = ({ className = '', ...props }) => (
    <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input {...props} className={`${fieldClass} pl-9 ${className}`} />
    </div>
)

export const Select = ({ children, className = '', ...props }) => (
    <div className="relative">
        <select {...props} className={`${fieldClass} appearance-none pr-9 ${className}`}>
            {children}
        </select>
        <ChevronDown
            size={15}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
    </div>
)