import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearAccessToken, getMe, logout } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    async function bootstrapAuth() {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setAuthLoading(false);
            return;
        }

        try {
            const me = await getMe();
            setUser(me);
        } catch (error) {
            clearAccessToken();
            setUser(null);
        } finally {
            setAuthLoading(false);
        }
    }

    async function loginUser(nextUser, accessToken) {
        if (accessToken) {
            localStorage.setItem("accessToken", accessToken);
        }
        setUser(nextUser);
    }

    async function logoutUser() {
        try {
            await logout();
        } catch (_) {
            clearAccessToken();
        } finally {
            setUser(null);
            window.location.href = "/";
        }
    }

    useEffect(() => {
        bootstrapAuth();
    }, []);

    const value = useMemo(
        () => ({
            user,
            setUser,
            authLoading,
            loginUser,
            logoutUser,
            isAuthenticated: !!user,
        }),
        [user, authLoading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}