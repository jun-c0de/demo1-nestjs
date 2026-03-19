import { useNavigate } from "react-router";
import ThemeToggleButton from "./ThemeToggleButton";

export default function SiteHeader({
    showThemeToggle = false,
    onLoginClick,
    onSignupClick,
    hideAuthButtons = false,
}) {
    const navigate = useNavigate();

    return (
        <header className="site-header">
            <div className="brand-box" onClick={() => navigate("/")}>
                <div className="brand-dots">
                    <span />
                    <span />
                    <span />
                </div>
                <span className="brand-text">CRAFT</span>
            </div>

            <div className="header-actions">
                {showThemeToggle && <ThemeToggleButton />}

                {!hideAuthButtons && (
                    <>
                        <button
                            type="button"
                            className="header-link-btn"
                            onClick={onLoginClick || (() => navigate("/auth?mode=login"))}
                        >
                            Login
                        </button>

                        <button
                            type="button"
                            className="header-pill-btn"
                            onClick={onSignupClick || (() => navigate("/auth?mode=signup"))}
                        >
                            Sign up
                        </button>
                    </>
                )}
            </div>
        </header>
    );
}