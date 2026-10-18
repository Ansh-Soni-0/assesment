import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
export class ErrorBoundary extends Component {
    state = {
        hasError: false,
        error: null,
    };
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (_jsxs("div", { className: "min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-rose-100 shadow-sm m-4", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-4", children: _jsx(AlertTriangle, { className: "w-6 h-6" }) }), _jsx("h2", { className: "text-lg font-bold text-slate-900 mb-2", children: "Something went wrong" }), _jsx("p", { className: "text-sm text-slate-600 max-w-md mb-6", children: "An unexpected error occurred in this view. Please try reloading or refreshing the current data." }), _jsxs("button", { onClick: () => {
                            this.setState({ hasError: false, error: null });
                            window.location.reload();
                        }, className: "inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors", children: [_jsx(RotateCcw, { className: "w-4 h-4" }), "Reload Page"] })] }));
        }
        return this.props.children;
    }
}
