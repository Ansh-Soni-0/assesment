import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getErrorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { StatusBadge, PriorityBadge, TypeBadge, ApprovalBadge } from '../components/common/Badge.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { ArrowLeft, AlertTriangle, CheckCircle2, XCircle, MessageSquare, History, Edit, HandMetal, UserPlus, Play, } from 'lucide-react';
export const WorkItemDetailPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    // Modals & form state
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedAssignee, setSelectedAssignee] = useState('');
    const [transitionStatus, setTransitionStatus] = useState('');
    const [transitionReason, setTransitionReason] = useState('');
    const [commentText, setCommentText] = useState('');
    const [actionError, setActionError] = useState(null);
    // Fetch Work Item
    const { data: item, isLoading, isError, refetch } = useQuery({
        queryKey: ['workItem', id],
        queryFn: async () => {
            const res = await api.get(`/work-items/${id}`);
            return res.data.data;
        },
        enabled: !!id,
    });
    // Fetch Activities
    const { data: activities } = useQuery({
        queryKey: ['workItemActivities', id],
        queryFn: async () => {
            const res = await api.get(`/work-items/${id}/activities`);
            return res.data.data;
        },
        enabled: !!id,
    });
    // Fetch Comments
    const { data: comments } = useQuery({
        queryKey: ['workItemComments', id],
        queryFn: async () => {
            const res = await api.get(`/work-items/${id}/comments`);
            return res.data.data;
        },
        enabled: !!id,
    });
    // Fetch Eligible Team Members for Reassignment
    const { data: teamDetails } = useQuery({
        queryKey: ['teamMembers', item?.teamId?._id],
        queryFn: async () => {
            if (!item?.teamId?._id)
                return { members: [] };
            const res = await api.get(`/teams/${item.teamId._id}`);
            return res.data.data;
        },
        enabled: !!item?.teamId?._id,
    });
    // Check if current user is lead or admin
    const isLeadOrAdmin = user?.globalRole === 'ADMIN' ||
        user?.memberships?.some((m) => m.teamId._id === item?.teamId?._id && m.role === 'LEAD');
    // Claim mutation
    const claimMutation = useMutation({
        mutationFn: async () => {
            await api.post(`/work-items/${id}/claim`, { version: item?.version });
        },
        onSuccess: () => {
            setActionError(null);
            queryClient.invalidateQueries({ queryKey: ['workItem', id] });
            queryClient.invalidateQueries({ queryKey: ['workItemActivities', id] });
        },
        onError: (err) => {
            setActionError(getErrorMessage(err));
        },
    });
    // Assign mutation
    const assignMutation = useMutation({
        mutationFn: async (assigneeId) => {
            await api.post(`/work-items/${id}/assign`, {
                version: item?.version,
                assigneeId,
            });
        },
        onSuccess: () => {
            setAssignModalOpen(false);
            setActionError(null);
            queryClient.invalidateQueries({ queryKey: ['workItem', id] });
            queryClient.invalidateQueries({ queryKey: ['workItemActivities', id] });
        },
        onError: (err) => {
            setActionError(getErrorMessage(err));
        },
    });
    // Transition mutation
    const transitionMutation = useMutation({
        mutationFn: async ({ targetStatus, approvalAction, reason, }) => {
            await api.post(`/work-items/${id}/transition`, {
                version: item?.version,
                targetStatus,
                approvalAction,
                reason,
            });
        },
        onSuccess: () => {
            setTransitionStatus('');
            setTransitionReason('');
            setActionError(null);
            queryClient.invalidateQueries({ queryKey: ['workItem', id] });
            queryClient.invalidateQueries({ queryKey: ['workItemActivities', id] });
        },
        onError: (err) => {
            setActionError(getErrorMessage(err));
        },
    });
    // Add Comment mutation
    const commentMutation = useMutation({
        mutationFn: async (body) => {
            await api.post(`/work-items/${id}/comments`, { body });
        },
        onSuccess: () => {
            setCommentText('');
            queryClient.invalidateQueries({ queryKey: ['workItemComments', id] });
            queryClient.invalidateQueries({ queryKey: ['workItemActivities', id] });
        },
        onError: (err) => {
            setActionError(getErrorMessage(err));
        },
    });
    if (isLoading) {
        return _jsx(LoadingSpinner, { size: "lg", message: "Loading work item details..." });
    }
    if (isError || !item) {
        return (_jsxs("div", { className: "p-8 text-center bg-white rounded-xl border border-rose-100 shadow-sm max-w-lg mx-auto space-y-3", children: [_jsx(AlertTriangle, { className: "w-8 h-8 text-rose-500 mx-auto" }), _jsx("h2", { className: "text-base font-bold text-slate-800", children: "Unable to load work item" }), _jsx("p", { className: "text-xs text-slate-500", children: "This item may not exist or you do not have permission to view work items for this team." }), _jsx(Link, { to: "/work-items", className: "inline-block px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold", children: "Back to Work Items" })] }));
    }
    // Permitted next status transitions
    const allowedTransitionsMap = {
        OPEN: ['IN_PROGRESS', 'BLOCKED'],
        IN_PROGRESS: ['BLOCKED', 'RESOLVED', 'OPEN'],
        BLOCKED: ['OPEN', 'IN_PROGRESS'],
        RESOLVED: ['CLOSED', 'IN_PROGRESS'],
        CLOSED: isLeadOrAdmin ? ['OPEN'] : [],
    };
    const nextStatuses = allowedTransitionsMap[item.status] || [];
    return (_jsxs("div", { className: "max-w-6xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Link, { to: "/work-items", className: "p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors", children: _jsx(ArrowLeft, { className: "w-4 h-4" }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-mono text-xs font-bold text-slate-500", children: item.identifier }), _jsxs("span", { className: "text-[11px] px-1.5 py-0.2 rounded bg-slate-100 font-mono text-slate-600", children: ["v", item.version] })] }), _jsx("h1", { className: "text-xl font-bold text-slate-900 tracking-tight", children: item.title })] })] }), _jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsxs(Link, { to: `/work-items/${id}/edit`, className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm", children: [_jsx(Edit, { className: "w-3.5 h-3.5" }), "Edit Item"] }), !item.assigneeId && !['RESOLVED', 'CLOSED'].includes(item.status) && (_jsxs("button", { onClick: () => claimMutation.mutate(), disabled: claimMutation.isPending, className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-xs font-semibold text-white shadow-sm transition-colors", children: [_jsx(HandMetal, { className: "w-3.5 h-3.5" }), "Claim Responsibility"] })), _jsxs("button", { onClick: () => {
                                    setSelectedAssignee(item.assigneeId?._id || '');
                                    setAssignModalOpen(true);
                                }, className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm", children: [_jsx(UserPlus, { className: "w-3.5 h-3.5" }), item.assigneeId ? 'Reassign' : 'Assign'] })] })] }), actionError && (_jsxs("div", { className: "p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start justify-between shadow-sm", children: [_jsxs("div", { className: "flex items-start gap-2", children: [_jsx(AlertTriangle, { className: "w-4 h-4 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "Action Conflict / Error" }), _jsx("p", { className: "mt-0.5", children: actionError })] })] }), _jsx("button", { onClick: () => refetch(), className: "text-xs text-rose-800 underline font-semibold ml-4", children: "Refresh Data" })] })), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsxs("div", { className: "bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx(TypeBadge, { type: item.type }), _jsx(StatusBadge, { status: item.status }), _jsx(PriorityBadge, { priority: item.priority }), item.requiresApproval && (_jsx(ApprovalBadge, { status: item.approvalStatus }))] }), _jsxs("div", { children: [_jsx("h3", { className: "text-xs font-bold uppercase tracking-wider text-slate-500 mb-2", children: "Operational Description" }), _jsx("p", { className: "text-sm text-slate-800 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100", children: item.description })] }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs", children: [_jsxs("div", { children: [_jsx("span", { className: "text-slate-400 block font-medium", children: "Assigned Team" }), _jsx("span", { className: "font-semibold text-slate-800 block mt-0.5", children: item.teamId?.name || '—' })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-400 block font-medium", children: "Assignee" }), _jsx("span", { className: "font-semibold text-slate-800 block mt-0.5", children: item.assigneeId?.name || _jsx("span", { className: "italic text-slate-400", children: "Unassigned" }) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-400 block font-medium", children: "Created By" }), _jsx("span", { className: "font-semibold text-slate-800 block mt-0.5", children: item.createdBy?.name || '—' })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-400 block font-medium", children: "Target Due Date" }), _jsx("span", { className: "font-semibold text-slate-800 block mt-0.5", children: item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '—' })] })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5", children: [_jsxs("div", { className: "flex items-center gap-2 pb-2 border-b border-slate-100", children: [_jsx(MessageSquare, { className: "w-4 h-4 text-slate-500" }), _jsxs("h3", { className: "text-xs font-bold uppercase tracking-wider text-slate-700", children: ["Investigation Notes & Discussion (", comments?.length || 0, ")"] })] }), _jsx("div", { className: "space-y-3 max-h-80 overflow-y-auto", children: !comments || comments.length === 0 ? (_jsx("p", { className: "py-4 text-center text-xs text-slate-400", children: "No notes or comments added yet" })) : (comments.map((c) => (_jsxs("div", { className: "p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1", children: [_jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-semibold text-slate-800", children: c.authorId?.name }), _jsx("span", { className: "text-[10px] text-slate-400 uppercase font-medium", children: c.authorId?.globalRole })] }), _jsx("span", { className: "text-[11px] text-slate-400", children: new Date(c.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) })] }), _jsx("p", { className: "text-xs text-slate-700 whitespace-pre-wrap", children: c.body })] }, c._id)))) }), _jsxs("form", { onSubmit: (e) => {
                                            e.preventDefault();
                                            if (commentText.trim())
                                                commentMutation.mutate(commentText.trim());
                                        }, className: "pt-2 border-t border-slate-100 flex gap-2", children: [_jsx("textarea", { value: commentText, onChange: (e) => setCommentText(e.target.value), placeholder: "Add an operational note or status update...", rows: 2, className: "flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white" }), _jsx("button", { type: "submit", disabled: commentMutation.isPending || !commentText.trim(), className: "px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors disabled:opacity-50 self-end", children: "Post Note" })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2 pb-2 border-b border-slate-100", children: [_jsx(History, { className: "w-4 h-4 text-slate-500" }), _jsx("h3", { className: "text-xs font-bold uppercase tracking-wider text-slate-700", children: "Append-Only Audit History" })] }), _jsx("div", { className: "relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200", children: !activities || activities.length === 0 ? (_jsx("p", { className: "py-2 text-xs text-slate-400", children: "No activity logged" })) : (activities.map((a) => (_jsxs("div", { className: "relative text-xs", children: [_jsx("span", { className: "absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-brand-500 ring-4 ring-white" }), _jsxs("div", { className: "flex items-baseline justify-between gap-2", children: [_jsx("span", { className: "font-semibold text-slate-800", children: a.actorId?.name || 'System' }), _jsx("span", { className: "text-[10px] text-slate-400", children: new Date(a.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) })] }), _jsxs("p", { className: "text-slate-600 mt-0.5", children: ["Action: ", _jsx("span", { className: "font-medium text-slate-900", children: a.action }), a.fieldChanged && _jsxs("span", { children: [" on '", a.fieldChanged, "'"] }), a.newValue !== null && a.newValue !== undefined && typeof a.newValue === 'string' && (_jsxs("span", { children: [" \u2192 ", a.newValue] }))] }), a.metadata?.reason && (_jsxs("p", { className: "text-[11px] text-slate-500 italic mt-0.5", children: ["\"", a.metadata.reason, "\""] }))] }, a._id)))) })] })] }), _jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4", children: [_jsx("h3", { className: "text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100", children: "Workflow Next Actions" }), item.requiresApproval && (_jsxs("div", { className: "p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs space-y-2.5", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsx("span", { className: "font-bold text-amber-900", children: "Formal Approval Gate" }), _jsx(ApprovalBadge, { status: item.approvalStatus })] }), _jsx("p", { className: "text-[11px] text-amber-800", children: item.approvalStatus === 'APPROVED'
                                                ? `Approved by ${item.approvedBy?.name || 'Lead'} on ${item.approvedAt ? new Date(item.approvedAt).toLocaleDateString() : ''}`
                                                : 'This work item cannot be marked as RESOLVED or CLOSED without team lead approval.' }), isLeadOrAdmin && item.approvalStatus !== 'APPROVED' && (_jsxs("div", { className: "flex gap-2 pt-1", children: [_jsxs("button", { onClick: () => transitionMutation.mutate({
                                                        approvalAction: 'APPROVE',
                                                        reason: 'Formal operational review passed',
                                                    }), disabled: transitionMutation.isPending, className: "flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-sm transition-colors inline-flex items-center justify-center gap-1", children: [_jsx(CheckCircle2, { className: "w-3.5 h-3.5" }), "Approve"] }), _jsxs("button", { onClick: () => transitionMutation.mutate({
                                                        approvalAction: 'REJECT',
                                                        reason: 'Requires further verification',
                                                    }), disabled: transitionMutation.isPending, className: "flex-1 py-1.5 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold shadow-sm transition-colors inline-flex items-center justify-center gap-1", children: [_jsx(XCircle, { className: "w-3.5 h-3.5" }), "Reject"] })] }))] })), _jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "block text-xs font-semibold text-slate-700", children: "Change Status to:" }), nextStatuses.length === 0 ? (_jsx("p", { className: "text-xs text-slate-400 italic", children: item.status === 'CLOSED'
                                                ? 'Work item is closed. Only Team Leads can reopen.'
                                                : 'No valid next transitions from current state.' })) : (_jsxs("div", { className: "space-y-2", children: [_jsxs("select", { value: transitionStatus, onChange: (e) => setTransitionStatus(e.target.value), className: "w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500", children: [_jsx("option", { value: "", children: "Select Target Status..." }), nextStatuses.map((st) => (_jsx("option", { value: st, children: st.replace('_', ' ') }, st)))] }), transitionStatus && (_jsx("input", { type: "text", value: transitionReason, onChange: (e) => setTransitionReason(e.target.value), placeholder: "Optional transition reason...", className: "w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500" })), _jsxs("button", { onClick: () => transitionMutation.mutate({
                                                        targetStatus: transitionStatus,
                                                        reason: transitionReason || undefined,
                                                    }), disabled: !transitionStatus || transitionMutation.isPending, className: "w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1.5", children: [_jsx(Play, { className: "w-3.5 h-3.5" }), "Apply Status Transition"] })] }))] })] }) })] }), _jsx(Modal, { isOpen: assignModalOpen, onClose: () => setAssignModalOpen(false), title: "Assign Work Item", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("p", { className: "text-xs text-slate-600", children: ["Select an active member of ", _jsx("strong", { children: item.teamId?.name }), " to assign responsibility for this item:"] }), _jsxs("select", { value: selectedAssignee, onChange: (e) => setSelectedAssignee(e.target.value), className: "w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500", children: [_jsx("option", { value: "", children: "Unassigned" }), teamDetails?.members.map((m) => (_jsxs("option", { value: m.userId._id, children: [m.userId.name, " (", m.role, ")"] }, m.userId._id)))] }), _jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [_jsx("button", { onClick: () => setAssignModalOpen(false), className: "px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50", children: "Cancel" }), _jsx("button", { onClick: () => assignMutation.mutate(selectedAssignee || null), disabled: assignMutation.isPending, className: "px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold", children: "Confirm Assignment" })] })] }) })] }));
};
