import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getErrorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { StatusBadge, PriorityBadge } from '../components/common/Badge.jsx';
import { ArrowLeft, Users, UserPlus, ShieldCheck, Trash2, AlertCircle, ExternalLink, } from 'lucide-react';
export const TeamDetailPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [addMemberModal, setAddMemberModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [memberRole, setMemberRole] = useState('MEMBER');
    const [actionError, setActionError] = useState(null);
    // Fetch Team Details
    const { data: team, isLoading } = useQuery({
        queryKey: ['teamDetail', id],
        queryFn: async () => {
            const res = await api.get(`/teams/${id}`);
            return res.data.data;
        },
        enabled: !!id,
    });
    // Fetch Team's Work Items
    const { data: teamItems } = useQuery({
        queryKey: ['teamWorkItems', id],
        queryFn: async () => {
            const res = await api.get(`/work-items?teamId=${id}&limit=50`);
            return res.data.data;
        },
        enabled: !!id,
    });
    // Fetch All Users for adding as members
    const { data: allUsers } = useQuery({
        queryKey: ['allUsersList'],
        queryFn: async () => {
            const res = await api.get('/users?limit=100');
            return res.data.data;
        },
        enabled: addMemberModal,
    });
    // Check if current user is lead or admin
    const isLeadOrAdmin = user?.globalRole === 'ADMIN' ||
        user?.memberships?.some((m) => m.teamId._id === id && m.role === 'LEAD');
    // Add Member Mutation
    const addMemberMutation = useMutation({
        mutationFn: async () => {
            await api.post(`/teams/${id}/members`, {
                userId: selectedUserId,
                role: memberRole,
            });
        },
        onSuccess: () => {
            setAddMemberModal(false);
            setSelectedUserId('');
            setActionError(null);
            queryClient.invalidateQueries({ queryKey: ['teamDetail', id] });
            queryClient.invalidateQueries({ queryKey: ['teamsList'] });
        },
        onError: (err) => {
            setActionError(getErrorMessage(err));
        },
    });
    // Update Member Role Mutation
    const updateRoleMutation = useMutation({
        mutationFn: async ({ userId, newRole }) => {
            await api.patch(`/teams/${id}/members/${userId}`, { role: newRole });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teamDetail', id] });
        },
        onError: (err) => {
            setActionError(getErrorMessage(err));
        },
    });
    // Remove Member Mutation
    const removeMemberMutation = useMutation({
        mutationFn: async (userId) => {
            await api.delete(`/teams/${id}/members/${userId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teamDetail', id] });
            queryClient.invalidateQueries({ queryKey: ['teamsList'] });
        },
        onError: (err) => {
            setActionError(getErrorMessage(err));
        },
    });
    if (isLoading) {
        return _jsx(LoadingSpinner, { size: "lg", message: "Loading team details..." });
    }
    if (!team) {
        return _jsx("div", { className: "p-8 text-center text-slate-500", children: "Team not found" });
    }
    const existingMemberUserIds = new Set(team.members.map((m) => m.userId?._id));
    const availableUsers = allUsers?.users.filter((u) => !existingMemberUserIds.has(u._id)) || [];
    return (_jsxs("div", { className: "max-w-6xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Link, { to: "/teams", className: "p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors", children: _jsx(ArrowLeft, { className: "w-4 h-4" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-slate-900 tracking-tight", children: team.name }), _jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: team.description || 'No description' })] })] }), isLeadOrAdmin && (_jsxs("button", { onClick: () => setAddMemberModal(true), className: "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-xs font-semibold text-white shadow-sm transition-colors", children: [_jsx(UserPlus, { className: "w-3.5 h-3.5" }), "Add Team Member"] }))] }), actionError && (_jsxs("div", { className: "p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4 flex-shrink-0" }), _jsx("span", { children: actionError })] })), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4", children: [_jsx("div", { className: "flex items-center justify-between pb-2 border-b border-slate-100", children: _jsxs("h3", { className: "text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2", children: [_jsx(Users, { className: "w-4 h-4 text-slate-500" }), "Team Members (", team.members.length, ")"] }) }), _jsx("div", { className: "divide-y divide-slate-100 space-y-2", children: team.members.map((m) => (_jsxs("div", { className: "pt-2 first:pt-0 flex items-center justify-between gap-2", children: [_jsxs("div", { children: [_jsx("span", { className: "font-semibold text-xs text-slate-900 block", children: m.userId?.name }), _jsx("span", { className: "text-[11px] text-slate-500 block truncate", children: m.userId?.email })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `text-[10px] font-bold px-2 py-0.5 rounded border ${m.role === 'LEAD'
                                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                        : 'bg-slate-50 text-slate-600 border-slate-200'}`, children: m.role }), isLeadOrAdmin && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { title: m.role === 'LEAD' ? 'Demote to Member' : 'Promote to Lead', onClick: () => updateRoleMutation.mutate({
                                                                userId: m.userId._id,
                                                                newRole: m.role === 'LEAD' ? 'MEMBER' : 'LEAD',
                                                            }), className: "p-1 rounded text-slate-400 hover:text-brand-600 hover:bg-slate-50", children: _jsx(ShieldCheck, { className: "w-3.5 h-3.5" }) }), _jsx("button", { title: "Remove Member", onClick: () => removeMemberMutation.mutate(m.userId._id), className: "p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-50", children: _jsx(Trash2, { className: "w-3.5 h-3.5" }) })] }))] })] }, m._id))) })] }), _jsxs("div", { className: "lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col", children: [_jsxs("div", { className: "flex items-center justify-between px-5 py-4 border-b border-slate-100", children: [_jsxs("h3", { className: "text-xs font-bold uppercase tracking-wider text-slate-700", children: ["Team Work Queue (", teamItems?.items.length || 0, ")"] }), _jsx(Link, { to: `/work-items?teamId=${id}`, className: "text-xs font-semibold text-brand-600 hover:text-brand-800", children: "Filter in Work Items \u2192" })] }), _jsx("div", { className: "divide-y divide-slate-100 overflow-x-auto flex-1", children: !teamItems?.items || teamItems.items.length === 0 ? (_jsx("p", { className: "p-8 text-center text-xs text-slate-400", children: "No work items found for this team" })) : (_jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { className: "bg-slate-50 text-slate-500 font-semibold border-b border-slate-200", children: _jsxs("tr", { children: [_jsx("th", { className: "py-2.5 px-4", children: "Identifier" }), _jsx("th", { className: "py-2.5 px-4", children: "Title" }), _jsx("th", { className: "py-2.5 px-4", children: "Status" }), _jsx("th", { className: "py-2.5 px-4", children: "Priority" }), _jsx("th", { className: "py-2.5 px-4", children: "Assignee" }), _jsx("th", { className: "py-2.5 px-4 text-right", children: "View" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: teamItems.items.map((item) => (_jsxs("tr", { className: "hover:bg-slate-50/70 transition-colors", children: [_jsx("td", { className: "py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap", children: _jsx(Link, { to: `/work-items/${item._id}`, className: "hover:text-brand-600", children: item.identifier }) }), _jsx("td", { className: "py-3 px-4 max-w-xs truncate font-medium text-slate-900", children: _jsx(Link, { to: `/work-items/${item._id}`, className: "hover:text-brand-600", children: item.title }) }), _jsx("td", { className: "py-3 px-4 whitespace-nowrap", children: _jsx(StatusBadge, { status: item.status }) }), _jsx("td", { className: "py-3 px-4 whitespace-nowrap", children: _jsx(PriorityBadge, { priority: item.priority }) }), _jsx("td", { className: "py-3 px-4 text-slate-600 whitespace-nowrap", children: item.assigneeId?.name || _jsx("span", { className: "italic text-slate-400", children: "Unassigned" }) }), _jsx("td", { className: "py-3 px-4 text-right whitespace-nowrap", children: _jsx(Link, { to: `/work-items/${item._id}`, className: "p-1 rounded text-slate-400 hover:text-slate-700", children: _jsx(ExternalLink, { className: "w-3.5 h-3.5" }) }) })] }, item._id))) })] })) })] })] }), _jsx(Modal, { isOpen: addMemberModal, onClose: () => setAddMemberModal(false), title: `Add Member to ${team.name}`, children: _jsxs("form", { onSubmit: (e) => {
                        e.preventDefault();
                        if (selectedUserId)
                            addMemberMutation.mutate();
                    }, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700", children: "Select Employee *" }), _jsxs("select", { value: selectedUserId, onChange: (e) => setSelectedUserId(e.target.value), required: true, className: "mt-1.5 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500", children: [_jsx("option", { value: "", children: "Select Employee..." }), availableUsers.map((u) => (_jsxs("option", { value: u._id, children: [u.name, " (", u.email, ")"] }, u._id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700", children: "Team-Specific Role *" }), _jsxs("select", { value: memberRole, onChange: (e) => setMemberRole(e.target.value), className: "mt-1.5 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500", children: [_jsx("option", { value: "MEMBER", children: "Team Member" }), _jsx("option", { value: "LEAD", children: "Team Lead (Approver)" })] })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-2 border-t border-slate-100", children: [_jsx("button", { type: "button", onClick: () => setAddMemberModal(false), className: "px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50", children: "Cancel" }), _jsx("button", { type: "submit", disabled: addMemberMutation.isPending || !selectedUserId, className: "px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold disabled:opacity-50", children: addMemberMutation.isPending ? 'Adding...' : 'Add to Team' })] })] }) })] }));
};
