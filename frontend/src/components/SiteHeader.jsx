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
            <div
                className="site-header__brand"
                onClick={() => navigate("/")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate("/");
                    }
                }}
            >
                <div className="site-header__dots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                </div>
                <span className="site-header__text">CRAFT</span>
            </div>

            <div className="site-header__actions">
                {showThemeToggle && (
                    <div className="site-header__theme-toggle">
                        <ThemeToggleButton />
                    </div>
                )}

                {!hideAuthButtons && (
                    <>
                        <button
                            type="button"
                            className="site-header__link-btn"
                            onClick={onLoginClick || (() => navigate("/auth?mode=login"))}
                        >
                            Login
                        </button>

                        <button
                            type="button"
                            className="site-header__pill-btn"
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