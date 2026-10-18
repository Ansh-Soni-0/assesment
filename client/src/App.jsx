import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext.jsx';
import { AppLayout } from './components/layout/AppLayout.jsx';
import { LoadingSpinner } from './components/common/LoadingSpinner.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { WorkItemsPage } from './pages/WorkItemsPage.jsx';
import { WorkItemDetailPage } from './pages/WorkItemDetailPage.jsx';
import { WorkItemCreatePage } from './pages/WorkItemCreatePage.jsx';
import { WorkItemEditPage } from './pages/WorkItemEditPage.jsx';
import { MyWorkPage } from './pages/MyWorkPage.jsx';
import { TeamsPage } from './pages/TeamsPage.jsx';
import { TeamDetailPage } from './pages/TeamDetailPage.jsx';
import { UsersPage } from './pages/UsersPage.jsx';
const ProtectedRoute = ({ children, requiredRole, }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-slate-50", children: _jsx(LoadingSpinner, { size: "lg", message: "Authenticating session..." }) }));
    }
    if (!user) {
        return _jsx(Navigate, { to: "/login", state: { from: location }, replace: true });
    }
    if (requiredRole && user.globalRole !== requiredRole) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
export const App = () => {
    return (_jsx(BrowserRouter, { children: _jsx(AuthProvider, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsxs(Route, { element: _jsx(ProtectedRoute, { children: _jsx(AppLayout, {}) }), children: [_jsx(Route, { path: "/", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "/work-items", element: _jsx(WorkItemsPage, {}) }), _jsx(Route, { path: "/work-items/new", element: _jsx(WorkItemCreatePage, {}) }), _jsx(Route, { path: "/work-items/:id", element: _jsx(WorkItemDetailPage, {}) }), _jsx(Route, { path: "/work-items/:id/edit", element: _jsx(WorkItemEditPage, {}) }), _jsx(Route, { path: "/my-work", element: _jsx(MyWorkPage, {}) }), _jsx(Route, { path: "/teams", element: _jsx(TeamsPage, {}) }), _jsx(Route, { path: "/teams/:id", element: _jsx(TeamDetailPage, {}) }), _jsx(Route, { path: "/users", element: _jsx(ProtectedRoute, { requiredRole: "ADMIN", children: _jsx(UsersPage, {}) }) })] }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }) }));
};
export default App;
