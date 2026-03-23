import { useState } from "react";
import ThemeToggleButton from "../ThemeToggleButton";
import ProfileMenu from "../ProfileMenu";

export default function Topbar({
    user,
    onCreateClick,
    onLogout,
    onGoDashboard,
}) {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    function handleBrandKeyDown(event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onGoDashboard?.();
        }
    }

    return (
        <header className="topbar">
            <div
                className="topbar__brand"
                role="button"
                tabIndex={0}
                onClick={onGoDashboard}
                onKeyDown={handleBrandKeyDown}
            >
                <span className="topbar__brand-text">CRAFT</span>
            </div>

            <div className="topbar__actions">
                <button
                    type="button"
                    className="topbar__create-btn"
                    onClick={onCreateClick}
                >
                    + 새 프로젝트
                </button>

                <div className="topbar__theme-toggle">
                    <ThemeToggleButton />
                </div>

                <button
                    type="button"
                    className="topbar__profile-btn"
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                    aria-label="프로필 메뉴 열기"
                >
                    {user?.picture ? (
                        <img
                            src={user.picture}
                            alt={user?.name || "사용자 프로필"}
                            className="topbar__avatar-image"
                        />
                    ) : (
                        <span className="topbar__avatar-fallback">
                            {user?.name?.charAt(0) || "U"}
                        </span>
                    )}
                </button>

                {isProfileMenuOpen && (
                    <ProfileMenu
                        user={user}
                        onClose={() => setIsProfileMenuOpen(false)}
                        onLogout={onLogout}
                        onOpenSettings={() => {
                            setIsProfileMenuOpen(false);
                            alert("계정 설정은 다음 단계에서 연결할게요.");
                        }}
                    />
                )}
            </div>
        </header>
    );
}