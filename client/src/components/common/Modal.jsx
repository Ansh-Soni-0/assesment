import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md', }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape')
                onClose();
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in", children: _jsxs("div", { className: `w-full ${maxWidth} bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all`, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50", children: [_jsx("h3", { className: "text-base font-semibold text-slate-900", children: title }), _jsx("button", { onClick: onClose, className: "p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx("div", { className: "p-6", children: children })] }) }));
};
