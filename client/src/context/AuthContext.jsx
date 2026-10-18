import { jsx as _jsx } from "react/jsx-runtime";
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api/client.js';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const refreshUser = useCallback(async () => {
        try {
            const res = await api.get('/auth/me');
            if (res.data?.data?.user) {
                setUser(res.data.data.user);
            }
        }
        catch {
            setUser(null);
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    useEffect(() => {
        refreshUser();
    }, [refreshUser]);
    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        if (res.data?.data?.user) {
            setUser(res.data.data.user);
        }
    };
    const logout = async () => {
        try {
            await api.post('/auth/logout');
        }
        finally {
            setUser(null);
        }
    };
    return (_jsx(AuthContext.Provider, { value: { user, isLoading, login, logout, refreshUser }, children: children }));
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
