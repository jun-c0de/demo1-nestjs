import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, clearToken } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 앱이 처음 켜질 때 로그인 상태를 확인
    const checkAuth = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const data = await getMe();
            setUser(data); // 전역 유저 상태 저장
        } catch (err) {
            console.error('인증 실패:', err);
            clearToken();
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const logoutUser = () => {
        clearToken();
        setUser(null);
        window.location.href = '/'; // 홈으로 리다이렉트
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logoutUser, checkAuth }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);