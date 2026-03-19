import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div>로딩 중...</div>;

    // 유저 정보가 없으면 로그인 페이지로 이동시키되, 
    // 현재 위치(from)를 기억해서 보냅니다.
    if (!user) {
        return (
            <Navigate
                to="/auth?mode=login"
                replace
                state={{ from: location }}
            />
        );
    }

    // 인증된 유저라면 하위 라우트들을 렌더링합니다.
    return <Outlet />;
};

export default ProtectedRoute;