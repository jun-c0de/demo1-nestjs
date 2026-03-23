import { useEffect, useRef } from "react";

function getProviderLabel(provider) {
    switch (provider) {
        case "google":
            return "Google 계정";
        case "kakao":
            return "Kakao 계정";
        case "naver":
            return "Naver 계정";
        case "local":
        default:
            return "이메일 계정";
    }
}

function formatDate(dateString) {
    if (!dateString) return "-";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(date);
}

function formatRelativeTime(dateString) {
    if (!dateString) return "-";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";

    const now = new Date();
    const diffMs = now - date;

    const minute = 1000 * 60;
    const hour = minute * 60;
    const day = hour * 24;

    if (diffMs < minute) return "방금 전";
    if (diffMs < hour) return `${Math.floor(diffMs / minute)}분 전`;
    if (diffMs < day) return `${Math.floor(diffMs / hour)}시간 전`;
    if (diffMs < day * 30) return `${Math.floor(diffMs / day)}일 전`;

    return formatDate(dateString);
}

export default function ProfileMenu({
    user,
    isOpen,
    onClose,
    onLogout,
    onOpenSettings,
}) {
    const panelRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                onClose();
            }
        }

        function handleEscape(event) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="profile-menu-overlay">
            <div className="profile-menu-panel" ref={panelRef}>
                <div className="profile-menu-header">
                    <div className="profile-menu-user">
                        {user?.picture ? (
                            <img
                                src={user.picture}
                                alt="profile"
                                className="profile-menu-avatar"
                            />
                        ) : (
                            <div className="profile-menu-avatar profile-menu-avatar-fallback">
                                {user?.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                        )}

                        <div className="profile-menu-user-info">
                            <div className="profile-menu-name">{user?.name || "User"}</div>
                            <div className="profile-menu-email">{user?.email || ""}</div>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="profile-menu-close"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                <div className="profile-menu-section">
                    <div className="profile-menu-section-title">계정 정보</div>

                    <div className="profile-menu-info-row">
                        <span className="profile-menu-info-label">인증 방법</span>
                        <span className="profile-menu-info-value">
                            {getProviderLabel(user?.provider)}
                        </span>
                    </div>

                    <div className="profile-menu-info-row">
                        <span className="profile-menu-info-label">가입일</span>
                        <span className="profile-menu-info-value">
                            {formatDate(user?.createdAt)}
                        </span>
                    </div>

                    <div className="profile-menu-info-row">
                        <span className="profile-menu-info-label">마지막 활동</span>
                        <span className="profile-menu-info-value">
                            {formatRelativeTime(user?.lastLoginAt || user?.updatedAt)}
                        </span>
                    </div>
                </div>

                <div className="profile-menu-section">
                    <div className="profile-menu-section-title">빠른 메뉴</div>

                    <button
                        type="button"
                        className="profile-menu-action"
                        onClick={onOpenSettings}
                    >
                        <span>계정 설정</span>
                        <span>›</span>
                    </button>

                    <button
                        type="button"
                        className="profile-menu-action"
                        onClick={onLogout}
                    >
                        <span>로그아웃</span>
                        <span>›</span>
                    </button>
                </div>

                <div className="profile-plan-card">
                    <div className="profile-plan-header">
                        <div className="profile-plan-title">구독 플랜</div>
                        <div className="profile-plan-badge">무료 플랜</div>
                    </div>

                    <div className="profile-plan-credit-box">
                        <div>
                            <div className="profile-plan-credit-label">보유 크레딧</div>
                            <div className="profile-plan-credit-sub">디자인 파일당 20 소모</div>
                        </div>
                        <div className="profile-plan-credit-value">60</div>
                    </div>

                    <div className="profile-plan-projects">프로젝트 2 / 1</div>

                    <button type="button" className="profile-plan-upgrade-btn">
                        플랜 업그레이드
                    </button>
                </div>
            </div>
        </div>
    );
}