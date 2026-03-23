import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { getMe, login, signup } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";
import SiteHeader from "../components/SiteHeader";

const BACKEND_ORIGIN = import.meta.env.VITE_API_BASE_URL;

export default function AuthPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { user, setUser } = useAuth();

    const mode = searchParams.get("mode") === "signup" ? "signup" : "login";
    const isLogin = mode === "login";

    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const from = location.state?.from?.pathname || "/dashboard";

    const [loginForm, setLoginForm] = useState({
        email: "",
        password: "",
    });

    const [signupForm, setSignupForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    useEffect(() => {
        if (user) {
            navigate(from, { replace: true });
        }
    }, [user, navigate, from]);

    useEffect(() => {
        async function handleMessage(event) {
            if (event.origin !== BACKEND_ORIGIN) return;

            const data = event.data;
            if (!data || !data.type) return;

            if (data.type === "GOOGLE_AUTH_SUCCESS") {
                try {
                    const { accessToken } = data.data || {};

                    if (accessToken) {
                        localStorage.setItem("accessToken", accessToken);
                    }

                    const me = await getMe();
                    setUser(me);
                    navigate(from, { replace: true });
                } catch (err) {
                    setError(err.message || "Google 로그인 처리에 실패했습니다.");
                }
            }

            if (data.type === "GOOGLE_AUTH_ERROR") {
                setError(data.data?.message || "Google 로그인에 실패했습니다.");
            }
        }

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [navigate, from, setUser]);

    function handleLoginChange(e) {
        setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    }

    function handleSignupChange(e) {
        setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        try {
            if (isLogin) {
                await login(loginForm);
            } else {
                await signup({
                    name: signupForm.name,
                    email: signupForm.email,
                    password: signupForm.password,
                });
            }

            const me = await getMe();
            setUser(me);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message);
        }
    }

    function handleGoogleLogin() {
        const width = 520;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
            `${BACKEND_ORIGIN}/api/auth/google`,
            "googleLoginPopup",
            `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!popup) {
            alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.");
        }
    }

    function handleKakaoLogin() {
        alert("카카오 로그인은 다음 단계에서 연결할게요.");
    }

    function handleNaverLogin() {
        alert("네이버 로그인은 다음 단계에서 연결할게요.");
    }

    return (
        <div className="auth-layout">
            <SiteHeader showThemeToggle={true} hideAuthButtons={true} />

            <div className="auth-page">
                <div className="auth-card">
                    <h1 className="auth-title">
                        {isLogin ? "Start designing your furniture" : "Create Account"}
                    </h1>

                    <p className="auth-subtitle">
                        {isLogin ? "Sign in to continue" : "Sign up to get started"}
                    </p>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {!isLogin && (
                            <label className="input-shell">
                                <span className="input-icon">👤</span>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Full Name"
                                    value={signupForm.name}
                                    onChange={handleSignupChange}
                                    required
                                />
                            </label>
                        )}

                        <label className="input-shell">
                            <span className="input-icon">✉</span>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={isLogin ? loginForm.email : signupForm.email}
                                onChange={isLogin ? handleLoginChange : handleSignupChange}
                                required
                            />
                        </label>

                        <label className="input-shell">
                            <span className="input-icon">🔒</span>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                value={isLogin ? loginForm.password : signupForm.password}
                                onChange={isLogin ? handleLoginChange : handleSignupChange}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword((prev) => !prev)}
                            >
                                {showPassword ? "🙈" : "👁"}
                            </button>
                        </label>

                        {isLogin && (
                            <div className="auth-helper-row">
                                <button type="button" className="text-link-btn">
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        <button type="submit" className="auth-submit-btn">
                            {isLogin ? "Sign In" : "Create Account"}
                        </button>
                    </form>

                    {error && (
                        <p
                            className="error-text"
                            style={{ color: "var(--error-color)", marginTop: "1rem" }}
                        >
                            {error}
                        </p>
                    )}

                    <p className="auth-divider-text">OR CONTINUE WITH</p>

                    <div className="social-icon-row">
                        <button
                            type="button"
                            className="social-icon-btn google"
                            onClick={handleGoogleLogin}
                        >
                            G
                        </button>
                        <button
                            type="button"
                            className="social-icon-btn kakao"
                            onClick={handleKakaoLogin}
                        >
                            K
                        </button>
                        <button
                            type="button"
                            className="social-icon-btn naver"
                            onClick={handleNaverLogin}
                        >
                            N
                        </button>
                    </div>

                    <p className="auth-bottom-text">
                        {isLogin ? (
                            <>
                                Don&apos;t have an account? <Link to="/auth?mode=signup">Sign up</Link>
                            </>
                        ) : (
                            <>
                                Already have an account? <Link to="/auth?mode=login">Sign in</Link>
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}