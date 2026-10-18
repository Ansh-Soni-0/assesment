import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { getErrorMessage } from '../api/client.js';
import { Layers, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
const loginSchema = z.object({
    email: z.string().trim().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});
export const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [serverError, setServerError] = useState(null);
    const from = location.state?.from?.pathname || '/';
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });
    const onSubmit = async (data) => {
        try {
            setServerError(null);
            await login(data.email, data.password);
            navigate(from, { replace: true });
        }
        catch (err) {
            setServerError(getErrorMessage(err));
        }
    };
    const setDemoAccount = (email, pass) => {
        setValue('email', email, { shouldValidate: true });
        setValue('password', pass, { shouldValidate: true });
        setServerError(null);
    };
    return (_jsxs("div", { className: "min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "sm:mx-auto sm:w-full sm:max-w-md text-center", children: [_jsx("div", { className: "w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/30 mb-4", children: _jsx(Layers, { className: "w-8 h-8" }) }), _jsx("h2", { className: "text-2xl font-bold tracking-tight text-white", children: "NEWTONITE OPERATIONS" }), _jsx("p", { className: "mt-1 text-sm text-slate-400", children: "Internal operational work and pressure management system" })] }), _jsx("div", { className: "mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4", children: _jsxs("div", { className: "bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-100", children: [_jsxs("form", { className: "space-y-5", onSubmit: handleSubmit(onSubmit), children: [serverError && (_jsxs("div", { className: "flex items-start gap-3 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs", children: [_jsx(AlertCircle, { className: "w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" }), _jsx("span", { children: serverError })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700", children: "Work Email Address" }), _jsxs("div", { className: "mt-1.5", children: [_jsx("input", { type: "email", autoComplete: "email", ...register('email'), className: "w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all", placeholder: "name@newtonite.local" }), errors.email && (_jsx("p", { className: "mt-1 text-xs text-rose-600", children: errors.email.message }))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700", children: "Password" }), _jsxs("div", { className: "mt-1.5", children: [_jsx("input", { type: "password", autoComplete: "current-password", ...register('password'), className: "w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }), errors.password && (_jsx("p", { className: "mt-1 text-xs text-rose-600", children: errors.password.message }))] })] }), _jsx("div", { children: _jsxs("button", { type: "submit", disabled: isSubmitting, className: "w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed", children: [isSubmitting ? 'Authenticating...' : 'Sign In to Operations', _jsx(ArrowRight, { className: "w-4 h-4" })] }) })] }), _jsxs("div", { className: "mt-6 pt-6 border-t border-slate-100", children: [_jsxs("div", { className: "flex items-center gap-2 text-xs font-semibold text-slate-500 mb-3", children: [_jsx(KeyRound, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Development Demo Credentials (Click to load):" })] }), _jsxs("div", { className: "grid grid-cols-1 gap-2", children: [_jsxs("button", { type: "button", onClick: () => setDemoAccount('admin@newtonite.local', 'AdminSecure123!'), className: "text-left text-xs p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "font-semibold text-slate-900 block", children: "System Administrator" }), _jsx("span", { className: "text-slate-500 text-[11px]", children: "admin@newtonite.local" })] }), _jsx("span", { className: "text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded", children: "ADMIN" })] }), _jsxs("button", { type: "button", onClick: () => setDemoAccount('sarah.chen@newtonite.local', 'Password123!'), className: "text-left text-xs p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "font-semibold text-slate-900 block", children: "Sarah Chen" }), _jsx("span", { className: "text-slate-500 text-[11px]", children: "sarah.chen@newtonite.local" })] }), _jsx("span", { className: "text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded", children: "LEAD (Infra)" })] }), _jsxs("button", { type: "button", onClick: () => setDemoAccount('elena.rostova@newtonite.local', 'Password123!'), className: "text-left text-xs p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "font-semibold text-slate-900 block", children: "Elena Rostova" }), _jsx("span", { className: "text-slate-500 text-[11px]", children: "elena.rostova@newtonite.local" })] }), _jsx("span", { className: "text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded", children: "MEMBER" })] })] })] })] }) })] }));
};
