import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getErrorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { Pagination } from '../components/common/Pagination.jsx';
import { Shield, UserPlus, KeyRound, CheckCircle2, XCircle, AlertCircle, Search, } from 'lucide-react';
export const UsersPage = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    // Modals state
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editUserModal, setEditUserModal] = useState(null);
    const [error, setError] = useState(null);
    // Form states for user creation
    const [createName, setCreateName] = useState('');
    const [createEmail, setCreateEmail] = useState('');
    const [createPassword, setCreatePassword] = useState('');
    const [createRole, setCreateRole] = useState('MEMBER');
    // Form states for editing
    const [editName, setEditName] = useState('');
    const [editRole, setEditRole] = useState('MEMBER');
    const [editActive, setEditActive] = useState(true);
    const [resetPassword, setResetPassword] = useState('');
    const { data, isLoading } = useQuery({
        queryKey: ['adminUsers', page, search, roleFilter],
        queryFn: async () => {
            const params = new URLSearchParams({ page: page.toString(), limit: '15' });
            if (search.trim())
                params.append('search', search.trim());
            if (roleFilter)
                params.append('role', roleFilter);
            const res = await api.get(`/users?${params.toString()}`);
            return res.data.data;
        },
        enabled: user?.globalRole === 'ADMIN',
    });
    // Create User Mutation
    const createMutation = useMutation({
        mutationFn: async () => {
            await api.post('/users', {
                name: createName,
                email: createEmail,
                password: createPassword,
                globalRole: createRole,
            });
        },
        onSuccess: () => {
            setCreateModalOpen(false);
            setCreateName('');
            setCreateEmail('');
            setCreatePassword('');
            setError(null);
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
        },
        onError: (err) => {
            setError(getErrorMessage(err));
        },
    });
    // Update User Mutation
    const updateMutation = useMutation({
        mutationFn: async () => {
            if (!editUserModal)
                return;
            const payload = {
                name: editName,
                globalRole: editRole,
                isActive: editActive,
            };
            if (resetPassword.trim()) {
                payload.password = resetPassword.trim();
            }
            await api.patch(`/users/${editUserModal._id}`, payload);
        },
        onSuccess: () => {
            setEditUserModal(null);
            setResetPassword('');
            setError(null);
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
        },
        onError: (err) => {
            setError(getErrorMessage(err));
        },
    });
    const openEditModal = (u) => {
        setEditUserModal(u);
        setEditName(u.name);
        setEditRole(u.globalRole);
        setEditActive(u.isActive);
        setResetPassword('');
        setError(null);
    };
    if (user?.globalRole !== 'ADMIN') {
        return (_jsxs("div", { className: "p-8 text-center text-slate-500 max-w-md mx-auto", children: [_jsx(Shield, { className: "w-10 h-10 text-slate-300 mx-auto mb-3" }), _jsx("h2", { className: "text-base font-bold text-slate-800", children: "Administrative Access Required" }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: "Only authorized System Administrators can view and manage user accounts." })] }));
    }
    const users = data?.users || [];
    const pagination = data?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-slate-900 tracking-tight", children: "User Administration" }), _jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Manage global accounts, roles, access states, and credential security" })] }), _jsxs("button", { onClick: () => {
                            setError(null);
                            setCreateModalOpen(true);
                        }, className: "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-xs font-semibold text-white shadow-sm transition-colors", children: [_jsx(UserPlus, { className: "w-3.5 h-3.5" }), "Create User"] })] }), _jsxs("div", { className: "flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-xs", children: [_jsxs("div", { className: "relative flex-1 max-w-sm", children: [_jsx(Search, { className: "w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" }), _jsx("input", { type: "text", value: search, onChange: (e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }, placeholder: "Search by name or email...", className: "w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500" })] }), _jsxs("select", { value: roleFilter, onChange: (e) => {
                            setRoleFilter(e.target.value);
                            setPage(1);
                        }, className: "px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500", children: [_jsx("option", { value: "", children: "All Roles" }), _jsx("option", { value: "ADMIN", children: "ADMIN" }), _jsx("option", { value: "OPERATOR", children: "OPERATOR" }), _jsx("option", { value: "MEMBER", children: "MEMBER" })] })] }), _jsxs("div", { className: "bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col", children: [isLoading ? (_jsx("div", { className: "py-16", children: _jsx(LoadingSpinner, { message: "Loading user directory..." }) })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { className: "bg-slate-50 text-slate-500 font-semibold border-b border-slate-200", children: _jsxs("tr", { children: [_jsx("th", { className: "py-3 px-4", children: "Name" }), _jsx("th", { className: "py-3 px-4", children: "Email" }), _jsx("th", { className: "py-3 px-4", children: "Global Role" }), _jsx("th", { className: "py-3 px-4", children: "Status" }), _jsx("th", { className: "py-3 px-4 text-right", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: users.map((u) => (_jsxs("tr", { className: "hover:bg-slate-50/70 transition-colors", children: [_jsx("td", { className: "py-3.5 px-4 font-semibold text-slate-900", children: u.name }), _jsx("td", { className: "py-3.5 px-4 text-slate-600", children: u.email }), _jsx("td", { className: "py-3.5 px-4", children: _jsx("span", { className: `text-[10px] font-bold px-2 py-0.5 rounded border ${u.globalRole === 'ADMIN'
                                                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                        : u.globalRole === 'OPERATOR'
                                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                            : 'bg-slate-50 text-slate-600 border-slate-200'}`, children: u.globalRole }) }), _jsx("td", { className: "py-3.5 px-4", children: u.isActive ? (_jsxs("span", { className: "inline-flex items-center gap-1 text-emerald-700 font-medium", children: [_jsx(CheckCircle2, { className: "w-3.5 h-3.5" }), "Active"] })) : (_jsxs("span", { className: "inline-flex items-center gap-1 text-rose-600 font-medium", children: [_jsx(XCircle, { className: "w-3.5 h-3.5" }), "Deactivated"] })) }), _jsx("td", { className: "py-3.5 px-4 text-right", children: _jsx("button", { onClick: () => openEditModal(u), className: "px-2.5 py-1 text-xs font-medium rounded border border-slate-200 hover:bg-slate-50 text-slate-700", children: "Edit" }) })] }, u._id))) })] }) })), _jsx(Pagination, { currentPage: pagination.page, totalPages: pagination.totalPages, totalItems: pagination.total, pageSize: pagination.limit, onPageChange: (p) => setPage(p) })] }), _jsx(Modal, { isOpen: createModalOpen, onClose: () => setCreateModalOpen(false), title: "Create New User", children: _jsxs("form", { onSubmit: (e) => {
                        e.preventDefault();
                        createMutation.mutate();
                    }, className: "space-y-4", children: [error && (_jsxs("div", { className: "p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4" }), _jsx("span", { children: error })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700", children: "Full Name *" }), _jsx("input", { type: "text", value: createName, onChange: (e) => setCreateName(e.target.value), required: true, className: "mt-1.5 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700", children: "Email Address *" }), _jsx("input", { type: "email", value: createEmail, onChange: (e) => setCreateEmail(e.target.value), required: true, className: "mt-1.5 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700", children: "Temporary Password (min 8 chars) *" }), _jsx("input", { type: "password", value: createPassword, onChange: (e) => setCreatePassword(e.target.value), required: true, minLength: 8, className: "mt-1.5 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700", children: "Global Role *" }), _jsxs("select", { value: createRole, onChange: (e) => setCreateRole(e.target.value), className: "mt-1.5 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500", children: [_jsx("option", { value: "MEMBER", children: "MEMBER (Team-scoped permissions)" }), _jsx("option", { value: "OPERATOR", children: "OPERATOR (Company-wide operational view)" }), _jsx("option", { value: "ADMIN", children: "ADMIN (Full administrative privileges)" })] })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-2 border-t border-slate-100", children: [_jsx("button", { type: "button", onClick: () => setCreateModalOpen(false), className: "px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50", children: "Cancel" }), _jsx("button", { type: "submit", disabled: createMutation.isPending, className: "px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold disabled:opacity-50", children: createMutation.isPending ? 'Creating...' : 'Create Account' })] })] }) }), editUserModal && (_jsx(Modal, { isOpen: !!editUserModal, onClose: () => setEditUserModal(null), title: `Edit User: ${editUserModal.email}`, children: _jsxs("form", { onSubmit: (e) => {
                        e.preventDefault();
                        updateMutation.mutate();
                    }, className: "space-y-4", children: [error && (_jsxs("div", { className: "p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4" }), _jsx("span", { children: error })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700", children: "Full Name" }), _jsx("input", { type: "text", value: editName, onChange: (e) => setEditName(e.target.value), required: true, className: "mt-1.5 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700", children: "Global Role" }), _jsxs("select", { value: editRole, onChange: (e) => setEditRole(e.target.value), className: "mt-1.5 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500", children: [_jsx("option", { value: "MEMBER", children: "MEMBER" }), _jsx("option", { value: "OPERATOR", children: "OPERATOR" }), _jsx("option", { value: "ADMIN", children: "ADMIN" })] })] }), _jsx("div", { className: "pt-2 border-t border-slate-100", children: _jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: editActive, onChange: (e) => setEditActive(e.target.checked), className: "w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300" }), _jsx("span", { className: "text-xs font-semibold text-slate-800", children: "Account is Active (Uncheck to deactivate login access)" })] }) }), _jsxs("div", { className: "pt-2 border-t border-slate-100 space-y-1", children: [_jsxs("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5", children: [_jsx(KeyRound, { className: "w-3.5 h-3.5 text-slate-500" }), "Reset Password (Optional)"] }), _jsx("input", { type: "password", value: resetPassword, onChange: (e) => setResetPassword(e.target.value), placeholder: "Leave blank to preserve existing password", className: "mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500" })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-3 border-t border-slate-100", children: [_jsx("button", { type: "button", onClick: () => setEditUserModal(null), className: "px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50", children: "Cancel" }), _jsx("button", { type: "submit", disabled: updateMutation.isPending, className: "px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold disabled:opacity-50", children: updateMutation.isPending ? 'Saving...' : 'Save Changes' })] })] }) }))] }));
};
