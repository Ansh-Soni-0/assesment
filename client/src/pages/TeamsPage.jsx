import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getErrorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { Link } from 'react-router-dom';
import { Users, PlusCircle, ArrowRight, AlertCircle } from 'lucide-react';
export const TeamsPage = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState(null);
    const canCreateTeam = user?.globalRole === 'ADMIN' || user?.globalRole === 'OPERATOR';
    const { data: teams, isLoading } = useQuery({
        queryKey: ['teamsList'],
        queryFn: async () => {
            const res = await api.get('/teams');
            return res.data.data;
        },
    });
    const createMutation = useMutation({
        mutationFn: async () => {
            await api.post('/teams', { name, description });
        },
        onSuccess: () => {
            setName('');
            setDescription('');
            setError(null);
            setCreateModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['teamsList'] });
        },
        onError: (err) => {
            setError(getErrorMessage(err));
        },
    });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-slate-900 tracking-tight", children: "Teams & Workgroups" }), _jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Operational divisions, cross-functional memberships, and team leadership roles" })] }), canCreateTeam && (_jsxs("button", { onClick: () => setCreateModalOpen(true), className: "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-xs font-semibold text-white shadow-sm transition-colors", children: [_jsx(PlusCircle, { className: "w-3.5 h-3.5" }), "Create Team"] }))] }), isLoading ? (_jsx(LoadingSpinner, { size: "lg", message: "Loading teams..." })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5", children: teams?.map((team) => (_jsxs("div", { className: "bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between hover:border-slate-300 transition-all group", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700", children: _jsx(Users, { className: "w-4 h-4" }) }), _jsxs("span", { className: "text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200", children: [team.openItemCount || 0, " Open Items"] })] }), _jsx("h3", { className: "text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors", children: team.name }), _jsx("p", { className: "text-xs text-slate-500 line-clamp-2 leading-relaxed", children: team.description || 'No description provided' })] }), _jsxs("div", { className: "pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs", children: [_jsxs("span", { className: "text-slate-500 font-medium", children: [team.memberCount || 0, " ", team.memberCount === 1 ? 'member' : 'members'] }), _jsxs(Link, { to: `/teams/${team._id}`, className: "font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform", children: ["Manage Team", _jsx(ArrowRight, { className: "w-3.5 h-3.5" })] })] })] }, team._id))) })), _jsx(Modal, { isOpen: createModalOpen, onClose: () => setCreateModalOpen(false), title: "Create New Team", children: _jsxs("form", { onSubmit: (e) => {
                        e.preventDefault();
                        createMutation.mutate();
                    }, className: "space-y-4", children: [error && (_jsxs("div", { className: "p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4" }), _jsx("span", { children: error })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700", children: "Team Name *" }), _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), required: true, placeholder: "e.g. Incident Response Taskforce", className: "mt-1.5 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700", children: "Description" }), _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), rows: 3, placeholder: "Operational responsibilities, scope, and objectives...", className: "mt-1.5 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white" })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-2 border-t border-slate-100", children: [_jsx("button", { type: "button", onClick: () => setCreateModalOpen(false), className: "px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50", children: "Cancel" }), _jsx("button", { type: "submit", disabled: createMutation.isPending || !name.trim(), className: "px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold disabled:opacity-50", children: createMutation.isPending ? 'Creating...' : 'Create Team' })] })] }) })] }));
};
