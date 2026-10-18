import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, getErrorMessage } from '../api/client.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { ArrowLeft, AlertTriangle, RotateCcw, Save } from 'lucide-react';
const editWorkItemSchema = z.object({
    version: z.number().int().positive(),
    title: z.string().trim().min(3).max(200),
    description: z.string().trim().min(5).max(5000),
    type: z.enum([
        'CUSTOMER_ISSUE',
        'ENGINEERING_PROBLEM',
        'PAYMENT_INVESTIGATION',
        'PRODUCTION_INCIDENT',
        'COMPLIANCE_REQUEST',
        'OPERATIONAL_TASK',
    ]),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    dueDate: z.string().optional(),
});
export const WorkItemEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [conflictError, setConflictError] = useState(null);
    const { data: item, isLoading, refetch } = useQuery({
        queryKey: ['workItem', id],
        queryFn: async () => {
            const res = await api.get(`/work-items/${id}`);
            return res.data.data;
        },
        enabled: !!id,
    });
    const { register, handleSubmit, reset, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(editWorkItemSchema),
    });
    useEffect(() => {
        if (item) {
            reset({
                version: item.version,
                title: item.title,
                description: item.description,
                type: item.type,
                priority: item.priority,
                dueDate: item.dueDate ? item.dueDate.split('T')[0] : '',
            });
            setConflictError(null);
        }
    }, [item, reset]);
    const updateMutation = useMutation({
        mutationFn: async (data) => {
            const payload = {
                version: data.version,
                title: data.title,
                description: data.description,
                type: data.type,
                priority: data.priority,
                dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
            };
            const res = await api.patch(`/work-items/${id}`, payload);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workItem', id] });
            queryClient.invalidateQueries({ queryKey: ['workItems'] });
            navigate(`/work-items/${id}`);
        },
        onError: (err) => {
            const status = err.response?.status;
            const message = getErrorMessage(err);
            if (status === 409) {
                setConflictError(message);
            }
            else {
                setConflictError(`Update failed: ${message}`);
            }
        },
    });
    const onSubmit = (formData) => {
        setConflictError(null);
        updateMutation.mutate(formData);
    };
    const handleReload = async () => {
        await refetch();
        setConflictError(null);
    };
    if (isLoading) {
        return _jsx(LoadingSpinner, { size: "lg", message: "Loading work item..." });
    }
    if (!item) {
        return _jsx("div", { className: "p-8 text-center text-slate-500", children: "Work item not found" });
    }
    return (_jsxs("div", { className: "max-w-3xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Link, { to: `/work-items/${id}`, className: "p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors", children: _jsx(ArrowLeft, { className: "w-4 h-4" }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-mono text-xs font-bold text-slate-500", children: item.identifier }), _jsxs("span", { className: "text-xs px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-600", children: ["v", item.version] })] }), _jsx("h1", { className: "text-xl font-bold text-slate-900 tracking-tight", children: "Edit Work Item" })] })] }), conflictError && (_jsxs("div", { className: "p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 space-y-3 shadow-sm animate-fade-in", children: [_jsxs("div", { className: "flex items-start gap-2.5", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-bold uppercase tracking-wider text-amber-800", children: "Optimistic Concurrency Conflict" }), _jsx("p", { className: "text-xs mt-1 text-amber-900", children: conflictError })] })] }), _jsxs("button", { type: "button", onClick: handleReload, className: "inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors", children: [_jsx(RotateCcw, { className: "w-3.5 h-3.5" }), "Reload Latest Server Version"] })] })), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-6", children: [_jsx("input", { type: "hidden", ...register('version', { valueAsNumber: true }) }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700", children: "Work Item Title *" }), _jsx("input", { type: "text", ...register('title'), className: "mt-1.5 w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white" }), errors.title && _jsx("p", { className: "mt-1 text-xs text-rose-600", children: errors.title.message })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700", children: "Description *" }), _jsx("textarea", { rows: 6, ...register('description'), className: "mt-1.5 w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white" }), errors.description && _jsx("p", { className: "mt-1 text-xs text-rose-600", children: errors.description.message })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700", children: "Work Type" }), _jsxs("select", { ...register('type'), className: "mt-1.5 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500", children: [_jsx("option", { value: "CUSTOMER_ISSUE", children: "Customer Issue" }), _jsx("option", { value: "ENGINEERING_PROBLEM", children: "Engineering Problem" }), _jsx("option", { value: "PAYMENT_INVESTIGATION", children: "Payment Investigation" }), _jsx("option", { value: "PRODUCTION_INCIDENT", children: "Production Incident" }), _jsx("option", { value: "COMPLIANCE_REQUEST", children: "Compliance Request" }), _jsx("option", { value: "OPERATIONAL_TASK", children: "Operational Task" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700", children: "Priority" }), _jsxs("select", { ...register('priority'), className: "mt-1.5 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500", children: [_jsx("option", { value: "LOW", children: "Low" }), _jsx("option", { value: "MEDIUM", children: "Medium" }), _jsx("option", { value: "HIGH", children: "High" }), _jsx("option", { value: "URGENT", children: "Urgent (P1 Escalation)" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700", children: "Target Due Date" }), _jsx("input", { type: "date", ...register('dueDate'), className: "mt-1.5 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500" })] }), _jsxs("div", { className: "flex items-center justify-end gap-3 pt-4 border-t border-slate-100", children: [_jsx(Link, { to: `/work-items/${id}`, className: "px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors", children: "Cancel" }), _jsxs("button", { type: "submit", disabled: isSubmitting || updateMutation.isPending, className: "px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1.5", children: [_jsx(Save, { className: "w-4 h-4" }), isSubmitting || updateMutation.isPending ? 'Saving...' : 'Save Changes'] })] })] })] }));
};
