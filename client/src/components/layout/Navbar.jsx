import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import { Bell, LogOut, User, Check, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
export const Navbar = () => {
    const { user, logout } = useAuth();
    const queryClient = useQueryClient();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const notifRef = useRef(null);
    const userRef = useRef(null);
    // Fetch notifications
    const { data: notifData } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const res = await api.get('/notifications');
            return res.data.data;
        },
        refetchInterval: 15000, // Poll every 15s for new in-app alerts
    });
    // Mark single as read
    const markReadMutation = useMutation({
        mutationFn: async (id) => {
            await api.patch(`/notifications/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
    // Mark all as read
    const markAllReadMutation = useMutation({
        mutationFn: async () => {
            await api.post('/notifications/mark-all-read');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
            if (userRef.current && !userRef.current.contains(e.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const unreadCount = notifData?.unreadCount || 0;
    const notifications = notifData?.notifications || [];
    return (_jsxs("header", { className: "sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200", children: [_jsx("div", { className: "flex items-center gap-3", children: _jsxs(Link, { to: "/", className: "flex items-center gap-2.5 group", children: [_jsx("div", { className: "w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm group-hover:bg-brand-600 transition-colors", children: _jsx(Layers, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("span", { className: "text-base font-bold text-slate-900 tracking-tight block", children: "NEWTONITE" }), _jsx("span", { className: "text-[10px] uppercase font-semibold tracking-wider text-slate-400 block -mt-1", children: "Operations Under Pressure" })] })] }) }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "relative", ref: notifRef, children: [_jsxs("button", { onClick: () => setShowNotifications(!showNotifications), className: "relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors", title: "Notifications", children: [_jsx(Bell, { className: "w-5 h-5" }), unreadCount > 0 && (_jsx("span", { className: "absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-rose-600 rounded-full animate-pulse", children: unreadCount > 9 ? '9+' : unreadCount }))] }), showNotifications && (_jsxs("div", { className: "absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in", children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-2 border-b border-slate-100", children: [_jsxs("span", { className: "text-xs font-bold uppercase tracking-wider text-slate-500", children: ["Notifications (", unreadCount, " unread)"] }), unreadCount > 0 && (_jsxs("button", { onClick: () => markAllReadMutation.mutate(), className: "text-xs text-brand-600 hover:text-brand-800 font-medium inline-flex items-center gap-1", children: [_jsx(Check, { className: "w-3.5 h-3.5" }), "Mark all read"] }))] }), _jsx("div", { className: "max-h-80 overflow-y-auto divide-y divide-slate-100", children: notifications.length === 0 ? (_jsx("p", { className: "py-6 text-center text-xs text-slate-400", children: "No notifications yet" })) : (notifications.map((n) => (_jsxs("div", { onClick: () => !n.read && markReadMutation.mutate(n._id), className: `p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${!n.read ? 'bg-blue-50/50' : ''}`, children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("span", { className: "font-semibold text-slate-800", children: n.title }), !n.read && _jsx("span", { className: "w-2 h-2 rounded-full bg-brand-600 flex-shrink-0 mt-1" })] }), _jsx("p", { className: "text-slate-600 mt-1", children: n.message }), _jsx("span", { className: "text-[10px] text-slate-400 mt-1 block", children: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })] }, n._id)))) })] }))] }), _jsxs("div", { className: "relative", ref: userRef, children: [_jsxs("button", { onClick: () => setShowUserMenu(!showUserMenu), className: "flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-semibold text-xs flex items-center justify-center border border-brand-200", children: user?.name ? user.name.charAt(0).toUpperCase() : 'U' }), _jsxs("div", { className: "text-left hidden md:block", children: [_jsx("span", { className: "text-xs font-semibold text-slate-800 block leading-tight", children: user?.name }), _jsx("span", { className: "text-[10px] font-medium text-slate-500 uppercase", children: user?.globalRole })] })] }), showUserMenu && (_jsxs("div", { className: "absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in", children: [_jsxs("div", { className: "px-4 py-2 border-b border-slate-100", children: [_jsx("p", { className: "text-xs font-semibold text-slate-900", children: user?.name }), _jsx("p", { className: "text-[11px] text-slate-500 truncate", children: user?.email }), _jsx("div", { className: "mt-1", children: _jsxs("span", { className: "inline-block px-1.5 py-0.5 text-[10px] font-medium rounded bg-slate-100 text-slate-700 border border-slate-200", children: ["Role: ", user?.globalRole] }) })] }), _jsxs("div", { className: "px-2 py-1", children: [_jsxs(Link, { to: "/my-work", onClick: () => setShowUserMenu(false), className: "flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors", children: [_jsx(User, { className: "w-4 h-4 text-slate-400" }), "My Work & Assignments"] }), _jsxs("button", { onClick: () => {
                                                    setShowUserMenu(false);
                                                    logout();
                                                }, className: "w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left", children: [_jsx(LogOut, { className: "w-4 h-4" }), "Sign Out"] })] })] }))] })] })] }));
};
