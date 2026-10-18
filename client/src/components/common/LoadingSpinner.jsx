import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Loader2 } from 'lucide-react';
export const LoadingSpinner = ({ size = 'md', message, }) => {
    const sizeMap = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-10 h-10',
    };
    return (_jsxs("div", { className: "flex flex-col items-center justify-center p-6 text-slate-500", children: [_jsx(Loader2, { className: `${sizeMap[size]} animate-spin text-brand-600 mb-2` }), message && _jsx("p", { className: "text-sm font-medium text-slate-600", children: message })] }));
};
