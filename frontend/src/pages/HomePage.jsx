import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { clearToken, getMe } from "../api/auth";

export default function HomePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        async function fetchMe() {
            try {
                const data = await getMe();
                setUser(data.user);
            } catch (error) {
                clearToken();
                navigate("/login", { replace: true });
            }
        }

        fetchMe();
    }, [navigate]);

    function handleLogout() {
        clearToken();
        navigate("/login", { replace: true });
    }

    if (!user) {
        return <div className="page-container">불러오는 중...</div>;
    }

    return (
        <div className="page-container">
            <h1>메인 페이지</h1>
            <p>{user.name}님, 로그인되었습니다.</p>
            <p>이메일: {user.email}</p>
            <button onClick={handleLogout}>로그아웃</button>
        </div>
    );
}