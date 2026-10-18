import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { LayoutDashboard, CheckSquare, Briefcase, Users, Shield, PlusCircle } from 'lucide-react';
export const Sidebar = () => {
    const { user } = useAuth();
    const isAdmin = user?.globalRole === 'ADMIN';
    const navItems = [
        { to: '/', label: 'Overview', icon: LayoutDashboard },
        { to: '/work-items', label: 'Work Items', icon: CheckSquare },
        { to: '/my-work', label: 'My Work', icon: Briefcase },
        { to: '/teams', label: 'Teams', icon: Users },
        ...(isAdmin ? [{ to: '/users', label: 'User Admin', icon: Shield }] : []),
    ];
    return (_jsxs("aside", { className: "w-64 bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]", children: [_jsxs("div", { className: "p-4 space-y-6", children: [_jsx("div", { children: _jsxs(NavLink, { to: "/work-items/new", className: "flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs shadow-sm transition-all", children: [_jsx(PlusCircle, { className: "w-4 h-4" }), "Create Work Item"] }) }), _jsx("nav", { className: "space-y-1", children: navItems.map((item) => {
                            const Icon = item.icon;
                            return (_jsxs(NavLink, { to: item.to, end: item.to === '/', className: ({ isActive }) => `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${isActive
                                    ? 'bg-brand-50 text-brand-700 font-semibold'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`, children: [_jsx(Icon, { className: "w-4 h-4" }), item.label] }, item.to));
                        }) })] }), _jsxs("div", { className: "p-4 border-t border-slate-100 bg-slate-50/50", children: [_jsxs("p", { className: "text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2", children: ["Your Teams (", user?.memberships?.length || 0, ")"] }), _jsx("div", { className: "space-y-1.5 max-h-36 overflow-y-auto", children: user?.memberships && user.memberships.length > 0 ? (user.memberships.map((m) => (_jsxs("div", { className: "flex items-center justify-between text-xs py-1 px-2 rounded bg-white border border-slate-200/60", children: [_jsx("span", { className: "truncate font-medium text-slate-700 pr-2", children: m.teamId?.name }), _jsx("span", { className: "text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 flex-shrink-0", children: m.role })] }, m._id)))) : (_jsx("p", { className: "text-[11px] text-slate-400", children: "No team assigned" })) })] })] }));
};
