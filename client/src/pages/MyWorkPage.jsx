import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { StatusBadge, PriorityBadge, TypeBadge } from '../components/common/Badge.jsx';
import { Pagination } from '../components/common/Pagination.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { Link, useSearchParams } from 'react-router-dom';
import { Briefcase, UserCheck, AlertOctagon, Clock, FileCheck, Calendar, ExternalLink, } from 'lucide-react';
export const MyWorkPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentTab = searchParams.get('tab') || 'assigned';
    const [page, setPage] = useState(1);
    const tabs = [
        { id: 'assigned', label: 'Assigned to Me', icon: UserCheck },
        { id: 'created', label: 'Created by Me', icon: Briefcase },
        { id: 'urgent', label: 'Urgent Work', icon: AlertOctagon },
        { id: 'overdue', label: 'Overdue Tasks', icon: Clock },
        { id: 'awaiting_approval', label: 'Awaiting Approval', icon: FileCheck },
    ];
    const handleTabChange = (tabId) => {
        setSearchParams({ tab: tabId });
        setPage(1);
    };
    const { data, isLoading, isError } = useQuery({
        queryKey: ['myWork', currentTab, page],
        queryFn: async () => {
            const res = await api.get(`/work-items?myWork=${currentTab}&page=${page}&limit=15`);
            return res.data.data;
        },
    });
    const items = data?.items || [];
    const pagination = data?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-slate-900 tracking-tight", children: "My Operational Work" }), _jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Dedicated view of your tasks, responsibilities, urgent blockers, and pending approvals" })] }), _jsx("div", { className: "flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px", children: tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = currentTab === tab.id;
                    return (_jsxs("button", { onClick: () => handleTabChange(tab.id), className: `flex items-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${isActive
                            ? 'border-brand-600 text-brand-700 bg-white'
                            : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`, children: [_jsx(Icon, { className: "w-4 h-4" }), tab.label] }, tab.id));
                }) }), _jsxs("div", { className: "bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col", children: [isLoading ? (_jsx("div", { className: "py-16", children: _jsx(LoadingSpinner, { message: "Loading your operational tasks..." }) })) : isError ? (_jsx("div", { className: "p-8 text-center text-rose-600 text-xs", children: "Failed to load tasks. Please refresh." })) : items.length === 0 ? (_jsxs("div", { className: "p-12 text-center space-y-2", children: [_jsx(Briefcase, { className: "w-8 h-8 text-slate-300 mx-auto" }), _jsx("h3", { className: "text-sm font-semibold text-slate-800", children: "No items in this queue" }), _jsx("p", { className: "text-xs text-slate-500", children: "You do not have any work items matching this view right now." })] })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { className: "bg-slate-50 text-slate-500 font-semibold border-b border-slate-200", children: _jsxs("tr", { children: [_jsx("th", { className: "py-3 px-4", children: "Identifier" }), _jsx("th", { className: "py-3 px-4", children: "Title" }), _jsx("th", { className: "py-3 px-4", children: "Type" }), _jsx("th", { className: "py-3 px-4", children: "Status" }), _jsx("th", { className: "py-3 px-4", children: "Priority" }), _jsx("th", { className: "py-3 px-4", children: "Team" }), _jsx("th", { className: "py-3 px-4", children: "Due Date" }), _jsx("th", { className: "py-3 px-4 text-right", children: "View" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: items.map((item) => {
                                        const isOverdue = item.dueDate &&
                                            new Date(item.dueDate) < new Date() &&
                                            !['RESOLVED', 'CLOSED'].includes(item.status);
                                        return (_jsxs("tr", { className: "hover:bg-slate-50/70 transition-colors", children: [_jsx("td", { className: "py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap", children: _jsx(Link, { to: `/work-items/${item._id}`, className: "hover:text-brand-600", children: item.identifier }) }), _jsx("td", { className: "py-3.5 px-4 max-w-xs truncate font-medium text-slate-900", children: _jsx(Link, { to: `/work-items/${item._id}`, className: "hover:text-brand-600", children: item.title }) }), _jsx("td", { className: "py-3.5 px-4 whitespace-nowrap", children: _jsx(TypeBadge, { type: item.type }) }), _jsx("td", { className: "py-3.5 px-4 whitespace-nowrap", children: _jsx(StatusBadge, { status: item.status }) }), _jsx("td", { className: "py-3.5 px-4 whitespace-nowrap", children: _jsx(PriorityBadge, { priority: item.priority }) }), _jsx("td", { className: "py-3.5 px-4 text-slate-600 whitespace-nowrap", children: item.teamId?.name }), _jsx("td", { className: "py-3.5 px-4 whitespace-nowrap", children: item.dueDate ? (_jsxs("span", { className: `inline-flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-600'}`, children: [_jsx(Calendar, { className: "w-3 h-3" }), new Date(item.dueDate).toLocaleDateString()] })) : (_jsx("span", { className: "text-slate-400", children: "\u2014" })) }), _jsx("td", { className: "py-3.5 px-4 text-right whitespace-nowrap", children: _jsx(Link, { to: `/work-items/${item._id}`, className: "p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors", children: _jsx(ExternalLink, { className: "w-3.5 h-3.5" }) }) })] }, item._id));
                                    }) })] }) })), _jsx(Pagination, { currentPage: pagination.page, totalPages: pagination.totalPages, totalItems: pagination.total, pageSize: pagination.limit, onPageChange: (p) => setPage(p) })] })] }));
};
