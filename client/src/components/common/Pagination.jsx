import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
export const Pagination = ({ currentPage, totalPages, totalItems, pageSize, onPageChange, }) => {
    if (totalPages <= 1 && totalItems <= pageSize)
        return null;
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);
    return (_jsxs("div", { className: "flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-white", children: [_jsxs("div", { className: "text-xs text-slate-500", children: ["Showing ", _jsx("span", { className: "font-semibold text-slate-700", children: startItem }), " to", ' ', _jsx("span", { className: "font-semibold text-slate-700", children: endItem }), " of", ' ', _jsx("span", { className: "font-semibold text-slate-700", children: totalItems }), " results"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: () => onPageChange(currentPage - 1), disabled: currentPage <= 1, className: "inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors", children: [_jsx(ChevronLeft, { className: "w-3.5 h-3.5" }), "Previous"] }), _jsxs("span", { className: "text-xs font-medium text-slate-600 px-2", children: ["Page ", currentPage, " of ", totalPages] }), _jsxs("button", { onClick: () => onPageChange(currentPage + 1), disabled: currentPage >= totalPages, className: "inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors", children: ["Next", _jsx(ChevronRight, { className: "w-3.5 h-3.5" })] })] })] }));
};
