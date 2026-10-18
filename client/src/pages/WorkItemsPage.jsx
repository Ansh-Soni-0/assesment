import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getErrorMessage } from '../api/client.js';
import { StatusBadge, PriorityBadge, TypeBadge } from '../components/common/Badge.jsx';
import { Pagination } from '../components/common/Pagination.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { Link } from 'react-router-dom';
import { Search, Filter, PlusCircle, RotateCcw, HandMetal, Calendar, AlertCircle, ExternalLink, } from 'lucide-react';
export const WorkItemsPage = () => {
    const queryClient = useQueryClient();
    // Filter & Search states
    const [page, setPage] = useState(1);
    const [limit] = useState(15);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState('');
    const [teamId, setTeamId] = useState('');
    const [type, setType] = useState('');
    const [overdue, setOverdue] = useState(false);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [actionError, setActionError] = useState(null);
    // Fetch teams for filter dropdown
    const { data: teamsData } = useQuery({
        queryKey: ['teamsList'],
        queryFn: async () => {
            const res = await api.get('/teams');
            return res.data.data;
        },
    });
    // Fetch paginated & filtered work items
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['workItems', page, limit, search, status, priority, teamId, type, overdue, sortBy, sortOrder],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sortBy,
                sortOrder,
            });
            if (search.trim())
                params.append('search', search.trim());
            if (status)
                params.append('status', status);
            if (priority)
                params.append('priority', priority);
            if (teamId)
                params.append('teamId', teamId);
            if (type)
                params.append('type', type);
            if (overdue)
                params.append('overdue', 'true');
            const res = await api.get(`/work-items?${params.toString()}`);
            return res.data.data;
        },
    });
    // Quick claim mutation
    const claimMutation = useMutation({
        mutationFn: async ({ id, version }) => {
            await api.post(`/work-items/${id}/claim`, { version });
        },
        onSuccess: () => {
            setActionError(null);
            queryClient.invalidateQueries({ queryKey: ['workItems'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
        },
        onError: (err) => {
            setActionError(getErrorMessage(err));
        },
    });
    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setPriority('');
        setTeamId('');
        setType('');
        setOverdue(false);
        setPage(1);
        setActionError(null);
    };
    const items = data?.items || [];
    const pagination = data?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-slate-900 tracking-tight", children: "Work Items" }), _jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Central operational queue with atomic task claiming, state transitions, and audit records" })] }), _jsxs(Link, { to: "/work-items/new", className: "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-xs font-semibold text-white shadow-sm transition-colors", children: [_jsx(PlusCircle, { className: "w-3.5 h-3.5" }), "Create Work Item"] })] }), actionError && (_jsxs("div", { className: "p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4 flex-shrink-0" }), _jsx("span", { children: actionError })] }), _jsx("button", { onClick: () => setActionError(null), className: "text-rose-500 hover:text-rose-700 text-xs", children: "Dismiss" })] })), _jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3", children: [_jsxs("div", { className: "lg:col-span-2 relative", children: [_jsx(Search, { className: "w-4 h-4 absolute left-3 top-2.5 text-slate-400" }), _jsx("input", { type: "text", value: search, onChange: (e) => {
                                            setSearch(e.target.value);
                                            setPage(1);
                                        }, placeholder: "Search by ID, title, keywords...", className: "w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white" })] }), _jsx("div", { children: _jsxs("select", { value: status, onChange: (e) => {
                                        setStatus(e.target.value);
                                        setPage(1);
                                    }, className: "w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500", children: [_jsx("option", { value: "", children: "All Statuses" }), _jsx("option", { value: "OPEN", children: "Open" }), _jsx("option", { value: "IN_PROGRESS", children: "In Progress" }), _jsx("option", { value: "BLOCKED", children: "Blocked" }), _jsx("option", { value: "RESOLVED", children: "Resolved" }), _jsx("option", { value: "CLOSED", children: "Closed" })] }) }), _jsx("div", { children: _jsxs("select", { value: priority, onChange: (e) => {
                                        setPriority(e.target.value);
                                        setPage(1);
                                    }, className: "w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500", children: [_jsx("option", { value: "", children: "All Priorities" }), _jsx("option", { value: "URGENT", children: "Urgent" }), _jsx("option", { value: "HIGH", children: "High" }), _jsx("option", { value: "MEDIUM", children: "Medium" }), _jsx("option", { value: "LOW", children: "Low" })] }) }), _jsx("div", { children: _jsxs("select", { value: teamId, onChange: (e) => {
                                        setTeamId(e.target.value);
                                        setPage(1);
                                    }, className: "w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500", children: [_jsx("option", { value: "", children: "All Teams" }), teamsData?.map((t) => (_jsx("option", { value: t._id, children: t.name }, t._id)))] }) }), _jsx("div", { children: _jsxs("select", { value: type, onChange: (e) => {
                                        setType(e.target.value);
                                        setPage(1);
                                    }, className: "w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500", children: [_jsx("option", { value: "", children: "All Types" }), _jsx("option", { value: "CUSTOMER_ISSUE", children: "Customer Issue" }), _jsx("option", { value: "ENGINEERING_PROBLEM", children: "Engineering" }), _jsx("option", { value: "PAYMENT_INVESTIGATION", children: "Payment" }), _jsx("option", { value: "PRODUCTION_INCIDENT", children: "Incident" }), _jsx("option", { value: "COMPLIANCE_REQUEST", children: "Compliance" }), _jsx("option", { value: "OPERATIONAL_TASK", children: "Task" })] }) })] }), _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("label", { className: "inline-flex items-center gap-2 cursor-pointer text-slate-700 font-medium", children: [_jsx("input", { type: "checkbox", checked: overdue, onChange: (e) => {
                                                    setOverdue(e.target.checked);
                                                    setPage(1);
                                                }, className: "w-3.5 h-3.5 rounded text-brand-600 focus:ring-brand-500 border-slate-300" }), _jsx("span", { children: "Show Overdue Only" })] }), _jsxs("div", { className: "flex items-center gap-1.5 text-slate-500", children: [_jsx("span", { children: "Sort by:" }), _jsxs("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), className: "text-xs bg-transparent border-0 font-medium text-slate-800 focus:ring-0 cursor-pointer", children: [_jsx("option", { value: "createdAt", children: "Date Created" }), _jsx("option", { value: "updatedAt", children: "Last Updated" }), _jsx("option", { value: "priority", children: "Priority" }), _jsx("option", { value: "dueDate", children: "Due Date" }), _jsx("option", { value: "identifier", children: "Identifier" })] }), _jsx("button", { onClick: () => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'), className: "px-1.5 py-0.5 rounded hover:bg-slate-100 font-mono text-[10px] text-slate-700 uppercase", children: sortOrder })] })] }), _jsxs("button", { onClick: clearFilters, className: "inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-medium transition-colors", children: [_jsx(RotateCcw, { className: "w-3 h-3" }), "Reset Filters"] })] })] }), _jsxs("div", { className: "bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col", children: [isLoading ? (_jsx("div", { className: "py-16", children: _jsx(LoadingSpinner, { message: "Querying work items..." }) })) : isError ? (_jsx("div", { className: "p-8 text-center text-rose-600 text-xs", children: "Failed to load work items. Please check connection and try again." })) : items.length === 0 ? (_jsxs("div", { className: "p-12 text-center space-y-2", children: [_jsx(Filter, { className: "w-8 h-8 text-slate-300 mx-auto" }), _jsx("h3", { className: "text-sm font-semibold text-slate-800", children: "No work items found" }), _jsx("p", { className: "text-xs text-slate-500 max-w-sm mx-auto", children: "No items matched the selected filters. Try clearing your search parameters or create a new operational work item." }), _jsx("button", { onClick: clearFilters, className: "mt-3 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50", children: "Clear all filters" })] })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { className: "bg-slate-50 text-slate-500 font-semibold border-b border-slate-200", children: _jsxs("tr", { children: [_jsx("th", { className: "py-3 px-4", children: "Identifier" }), _jsx("th", { className: "py-3 px-4", children: "Title" }), _jsx("th", { className: "py-3 px-4", children: "Type" }), _jsx("th", { className: "py-3 px-4", children: "Status" }), _jsx("th", { className: "py-3 px-4", children: "Priority" }), _jsx("th", { className: "py-3 px-4", children: "Team" }), _jsx("th", { className: "py-3 px-4", children: "Assignee" }), _jsx("th", { className: "py-3 px-4", children: "Due Date" }), _jsx("th", { className: "py-3 px-4 text-right", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: items.map((item) => {
                                        const isOverdue = item.dueDate &&
                                            new Date(item.dueDate) < new Date() &&
                                            !['RESOLVED', 'CLOSED'].includes(item.status);
                                        return (_jsxs("tr", { className: "hover:bg-slate-50/70 transition-colors", children: [_jsx("td", { className: "py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap", children: _jsx(Link, { to: `/work-items/${item._id}`, className: "hover:text-brand-600", children: item.identifier }) }), _jsxs("td", { className: "py-3.5 px-4 max-w-xs truncate font-medium text-slate-900", children: [_jsx(Link, { to: `/work-items/${item._id}`, className: "hover:text-brand-600", children: item.title }), item.requiresApproval && (_jsx("span", { className: "ml-1.5 inline-block w-2 h-2 rounded-full bg-amber-500", title: "Requires Approval" }))] }), _jsx("td", { className: "py-3.5 px-4 whitespace-nowrap", children: _jsx(TypeBadge, { type: item.type }) }), _jsx("td", { className: "py-3.5 px-4 whitespace-nowrap", children: _jsx(StatusBadge, { status: item.status }) }), _jsx("td", { className: "py-3.5 px-4 whitespace-nowrap", children: _jsx(PriorityBadge, { priority: item.priority }) }), _jsx("td", { className: "py-3.5 px-4 text-slate-600 whitespace-nowrap", children: item.teamId?.name || '—' }), _jsx("td", { className: "py-3.5 px-4 text-slate-600 whitespace-nowrap", children: item.assigneeId?.name ? (_jsx("span", { className: "font-medium text-slate-800", children: item.assigneeId.name })) : (_jsx("span", { className: "text-slate-400 italic", children: "Unassigned" })) }), _jsx("td", { className: "py-3.5 px-4 whitespace-nowrap", children: item.dueDate ? (_jsxs("span", { className: `inline-flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-600'}`, children: [_jsx(Calendar, { className: "w-3 h-3" }), new Date(item.dueDate).toLocaleDateString()] })) : (_jsx("span", { className: "text-slate-400", children: "\u2014" })) }), _jsx("td", { className: "py-3.5 px-4 text-right whitespace-nowrap", children: _jsxs("div", { className: "inline-flex items-center gap-2", children: [!item.assigneeId && !['RESOLVED', 'CLOSED'].includes(item.status) && (_jsxs("button", { onClick: () => claimMutation.mutate({ id: item._id, version: item.version }), disabled: claimMutation.isPending, className: "px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-medium text-[11px] inline-flex items-center gap-1 shadow-sm transition-colors", children: [_jsx(HandMetal, { className: "w-3 h-3" }), "Claim"] })), _jsx(Link, { to: `/work-items/${item._id}`, className: "p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors", title: "View Details", children: _jsx(ExternalLink, { className: "w-3.5 h-3.5" }) })] }) })] }, item._id));
                                    }) })] }) })), _jsx(Pagination, { currentPage: pagination.page, totalPages: pagination.totalPages, totalItems: pagination.total, pageSize: pagination.limit, onPageChange: (newPage) => setPage(newPage) })] })] }));
};
