import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { clearToken, getMe, getToken, logout } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        const token = getToken();

        if (!token) {
            setUser(null);
            setAuthLoading(false);
            return null;
        }

        try {
            const me = await getMe();
            setUser(me);
            return me;
        } catch (error) {
            clearToken();
            setUser(null);
            return null;
        } finally {
            setAuthLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const logoutUser = useCallback(async () => {
        try {
            await logout();
        } catch {
            clearToken();
        } finally {
            setUser(null);
            window.location.replace("/");
        }
    }, []);

    const value = useMemo(
        () => ({
            user,
            setUser,
            checkAuth,
            logoutUser,
            authLoading,
            loading: authLoading,
            isAuthenticated: Boolean(user),
        }),
        [user, checkAuth, logoutUser, authLoading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return context;
}