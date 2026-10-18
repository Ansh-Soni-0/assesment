import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { api, getErrorMessage } from '../api/client.js';
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
const createWorkItemFormSchema = z.object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().trim().min(5, 'Description must be at least 5 characters').max(5000),
    type: z.enum([
        'CUSTOMER_ISSUE',
        'ENGINEERING_PROBLEM',
        'PAYMENT_INVESTIGATION',
        'PRODUCTION_INCIDENT',
        'COMPLIANCE_REQUEST',
        'OPERATIONAL_TASK',
    ]),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    teamId: z.string().min(1, 'Please select an assigned team'),
    assigneeId: z.string().optional(),
    dueDate: z.string().optional(),
    requiresApproval: z.boolean().default(false),
});
export const WorkItemCreatePage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [serverError, setServerError] = useState(null);
    // Fetch teams for team selector
    const { data: teams } = useQuery({
        queryKey: ['teamsList'],
        queryFn: async () => {
            const res = await api.get('/teams');
            return res.data.data;
        },
    });
    const { register, handleSubmit, watch, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(createWorkItemFormSchema),
        defaultValues: {
            title: '',
            description: '',
            type: 'OPERATIONAL_TASK',
            priority: 'MEDIUM',
            teamId: '',
            assigneeId: '',
            dueDate: '',
            requiresApproval: false,
        },
    });
    const selectedTeamId = watch('teamId');
    // Fetch eligible members for selected team
    const { data: selectedTeamDetails } = useQuery({
        queryKey: ['teamDetails', selectedTeamId],
        queryFn: async () => {
            if (!selectedTeamId)
                return { members: [] };
            const res = await api.get(`/teams/${selectedTeamId}`);
            return res.data.data;
        },
        enabled: !!selectedTeamId,
    });
    const eligibleMembers = selectedTeamDetails?.members || [];
    const createMutation = useMutation({
        mutationFn: async (data) => {
            // Generate client idempotency key to prevent accidental double-click duplicates
            const idempotencyKey = `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const payload = {
                title: data.title,
                description: data.description,
                type: data.type,
                priority: data.priority,
                teamId: data.teamId,
                requiresApproval: data.requiresApproval,
            };
            if (data.assigneeId && data.assigneeId.trim()) {
                payload.assigneeId = data.assigneeId;
            }
            if (data.dueDate && data.dueDate.trim()) {
                payload.dueDate = new Date(data.dueDate).toISOString();
            }
            const res = await api.post('/work-items', payload, {
                headers: {
                    'Idempotency-Key': idempotencyKey,
                },
            });
            return res.data.data;
        },
        onSuccess: (createdItem) => {
            queryClient.invalidateQueries({ queryKey: ['workItems'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
            navigate(`/work-items/${createdItem._id}`);
        },
        onError: (err) => {
            setServerError(getErrorMessage(err));
        },
    });
    const onSubmit = (formData) => {
        setServerError(null);
        createMutation.mutate(formData);
    };
    return (_jsxs("div", { className: "max-w-3xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Link, { to: "/work-items", className: "p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors", children: _jsx(ArrowLeft, { className: "w-4 h-4" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-slate-900 tracking-tight", children: "Create Operational Work Item" }), _jsx("p", { className: "text-xs text-slate-500", children: "Submit a task, customer escalation, incident, or investigation into the central queue" })] })] }), serverError && (_jsxs("div", { className: "p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5", children: [_jsx(AlertCircle, { className: "w-4 h-4 flex-shrink-0 mt-0.5" }), _jsx("span", { children: serverError })] })), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700", children: "Work Item Title *" }), _jsx("input", { type: "text", ...register('title'), placeholder: "e.g. Europe cluster connection pool exhaustion", className: "mt-1.5 w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white" }), errors.title && _jsx("p", { className: "mt-1 text-xs text-rose-600", children: errors.title.message })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700", children: "Full Operational Description *" }), _jsx("textarea", { rows: 5, ...register('description'), placeholder: "Describe the context, symptoms, affected accounts, and expected outcome...", className: "mt-1.5 w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white" }), errors.description && _jsx("p", { className: "mt-1 text-xs text-rose-600", children: errors.description.message })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700", children: "Work Type *" }), _jsxs("select", { ...register('type'), className: "mt-1.5 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500", children: [_jsx("option", { value: "CUSTOMER_ISSUE", children: "Customer Issue" }), _jsx("option", { value: "ENGINEERING_PROBLEM", children: "Engineering Problem" }), _jsx("option", { value: "PAYMENT_INVESTIGATION", children: "Payment Investigation" }), _jsx("option", { value: "PRODUCTION_INCIDENT", children: "Production Incident" }), _jsx("option", { value: "COMPLIANCE_REQUEST", children: "Compliance Request" }), _jsx("option", { value: "OPERATIONAL_TASK", children: "Operational Task" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700", children: "Operational Priority *" }), _jsxs("select", { ...register('priority'), className: "mt-1.5 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500", children: [_jsx("option", { value: "LOW", children: "Low" }), _jsx("option", { value: "MEDIUM", children: "Medium" }), _jsx("option", { value: "HIGH", children: "High" }), _jsx("option", { value: "URGENT", children: "Urgent (P1 Escalation)" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700", children: "Responsible Team *" }), _jsxs("select", { ...register('teamId'), className: "mt-1.5 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500", children: [_jsx("option", { value: "", children: "Select Team..." }), teams?.map((t) => (_jsx("option", { value: t._id, children: t.name }, t._id)))] }), errors.teamId && _jsx("p", { className: "mt-1 text-xs text-rose-600", children: errors.teamId.message })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700", children: "Initial Assignee (Optional)" }), _jsxs("select", { ...register('assigneeId'), disabled: !selectedTeamId, className: "mt-1.5 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50", children: [_jsx("option", { value: "", children: "Leave Unassigned (Claimable)" }), eligibleMembers.map((m) => (_jsxs("option", { value: m.userId._id, children: [m.userId.name, " (", m.role, ")"] }, m.userId._id)))] }), _jsx("p", { className: "mt-1 text-[11px] text-slate-400", children: selectedTeamId
                                            ? 'Only verified members of the selected team can be assigned'
                                            : 'Select a team first to view eligible assignees' })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700", children: "Target Due Date (Optional)" }), _jsx("input", { type: "date", ...register('dueDate'), className: "mt-1.5 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500" })] }), _jsx("div", { className: "flex items-center pt-6", children: _jsxs("label", { className: "inline-flex items-start gap-2.5 cursor-pointer", children: [_jsx("input", { type: "checkbox", ...register('requiresApproval'), className: "w-4 h-4 mt-0.5 rounded text-brand-600 focus:ring-brand-500 border-slate-300" }), _jsxs("div", { children: [_jsx("span", { className: "text-xs font-semibold text-slate-800 block", children: "Requires Formal Approval" }), _jsx("span", { className: "text-[11px] text-slate-500 block", children: "Restricts resolution until signed off by a Team Lead or Administrator" })] })] }) })] }), _jsxs("div", { className: "flex items-center justify-end gap-3 pt-4 border-t border-slate-100", children: [_jsx(Link, { to: "/work-items", className: "px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors", children: "Cancel" }), _jsxs("button", { type: "submit", disabled: isSubmitting || createMutation.isPending, className: "px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1.5", children: [_jsx(CheckCircle2, { className: "w-4 h-4" }), isSubmitting || createMutation.isPending ? 'Submitting...' : 'Create Work Item'] })] })] })] }));
};
