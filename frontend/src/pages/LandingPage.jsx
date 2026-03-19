import { useNavigate } from "react-router";
import SiteHeader from "../components/SiteHeader";

export default function LandingPage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");

    function handleStart() {
        navigate(token ? "/dashboard" : "/auth?mode=login");
    }

    return (
        <div className="landing-page">
            <SiteHeader
                showThemeToggle={true}
                onLoginClick={() => navigate("/auth?mode=login")}
                onSignupClick={() => navigate("/auth?mode=signup")}
            />

            <main className="hero-section">
                <div className="hero-top-row">
                    <div className="hero-dots">
                        <span />
                        <span />
                        <span />
                    </div>
                    <p className="hero-subtitle">think thing thank</p>
                </div>

                <h1 className="hero-title">CRAFT</h1>

                <button type="button" className="hero-cta-btn" onClick={handleStart}>
                    Start Design
                </button>
            </main>
        </div>
    );
}