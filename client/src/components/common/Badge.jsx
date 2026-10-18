import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export const StatusBadge = ({ status }) => {
    const styles = {
        OPEN: { bg: 'bg-slate-100', text: 'text-slate-700 border-slate-200', label: 'Open', dot: 'bg-slate-400' },
        IN_PROGRESS: { bg: 'bg-blue-50', text: 'text-blue-700 border-blue-200', label: 'In Progress', dot: 'bg-blue-500' },
        BLOCKED: { bg: 'bg-amber-50', text: 'text-amber-800 border-amber-200', label: 'Blocked', dot: 'bg-amber-500' },
        RESOLVED: { bg: 'bg-emerald-50', text: 'text-emerald-700 border-emerald-200', label: 'Resolved', dot: 'bg-emerald-500' },
        CLOSED: { bg: 'bg-gray-100', text: 'text-gray-600 border-gray-200', label: 'Closed', dot: 'bg-gray-400' },
    };
    const current = styles[status] || styles.OPEN;
    return (_jsxs("span", { className: `inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${current.bg} ${current.text}`, children: [_jsx("span", { className: `w-1.5 h-1.5 rounded-full ${current.dot}` }), current.label] }));
};
export const PriorityBadge = ({ priority }) => {
    const styles = {
        LOW: { bg: 'bg-slate-100 text-slate-600 border-slate-200', text: '', label: 'Low' },
        MEDIUM: { bg: 'bg-blue-50 text-blue-700 border-blue-200', text: '', label: 'Medium' },
        HIGH: { bg: 'bg-orange-50 text-orange-700 border-orange-200', text: '', label: 'High' },
        URGENT: { bg: 'bg-rose-50 text-rose-700 border-rose-300 font-semibold', text: '', label: 'Urgent' },
    };
    const current = styles[priority] || styles.MEDIUM;
    return (_jsxs("span", { className: `inline-flex items-center px-2 py-0.5 rounded text-xs border ${current.bg}`, children: [priority === 'URGENT' && _jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping mr-1" }), current.label] }));
};
export const TypeBadge = ({ type }) => {
    const labels = {
        CUSTOMER_ISSUE: 'Customer Issue',
        ENGINEERING_PROBLEM: 'Engineering',
        PAYMENT_INVESTIGATION: 'Payment',
        PRODUCTION_INCIDENT: 'Incident',
        COMPLIANCE_REQUEST: 'Compliance',
        OPERATIONAL_TASK: 'Task',
    };
    return (_jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded text-xs font-normal bg-slate-100 text-slate-700 border border-slate-200", children: labels[type] || type }));
};
export const ApprovalBadge = ({ status }) => {
    if (status === 'NONE')
        return null;
    const styles = {
        NONE: { bg: '', label: '' },
        PENDING: { bg: 'bg-amber-100 text-amber-800 border-amber-300', label: 'Approval Required' },
        APPROVED: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: 'Approved' },
        REJECTED: { bg: 'bg-rose-100 text-rose-800 border-rose-300', label: 'Rejected' },
    };
    const current = styles[status];
    return (_jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${current.bg}`, children: current.label }));
};
