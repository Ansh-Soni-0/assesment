import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';
import { Sidebar } from './Sidebar.jsx';
import { ErrorBoundary } from '../common/ErrorBoundary.jsx';
export const AppLayout = () => {
    return (_jsxs("div", { className: "min-h-screen bg-slate-50 flex flex-col", children: [_jsx(Navbar, {}), _jsxs("div", { className: "flex-1 flex overflow-hidden", children: [_jsx(Sidebar, {}), _jsx("main", { className: "flex-1 overflow-y-auto p-6 md:p-8", children: _jsx(ErrorBoundary, { children: _jsx(Outlet, {}) }) })] })] }));
};
