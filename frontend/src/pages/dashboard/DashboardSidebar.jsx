export default function DashboardSidebar({
    counts,
    activeMenu,
    onMenuChange,
    onCreateProject,
}) {
    return (
        <aside className="dashboard-sidebar">
            <button type="button" className="new-project-btn" onClick={onCreateProject}>
                ＋ 새 프로젝트
            </button>

            <div className="sidebar-section-title">빠른 액세스</div>

            <nav className="sidebar-nav">
                <button
                    type="button"
                    className={`sidebar-item ${activeMenu === "active" ? "active" : ""}`}
                    onClick={() => onMenuChange("active")}
                >
                    <span>진행중 프로젝트</span>
                    {counts.active > 0 && (
                        <span className="sidebar-count-badge">{counts.active}</span>
                    )}
                </button>

                <button
                    type="button"
                    className={`sidebar-item ${activeMenu === "completed" ? "active" : ""}`}
                    onClick={() => onMenuChange("completed")}
                >
                    <span>완료된 프로젝트</span>
                    {counts.completed > 0 && (
                        <span className="sidebar-count-badge">{counts.completed}</span>
                    )}
                </button>

                <button
                    type="button"
                    className={`sidebar-item ${activeMenu === "sharedWithMe" ? "active" : ""}`}
                    onClick={() => onMenuChange("sharedWithMe")}
                >
                    <span>공유받은 파일</span>
                    {counts.sharedWithMe > 0 && (
                        <span className="sidebar-count-badge">{counts.sharedWithMe}</span>
                    )}
                </button>

                <button
                    type="button"
                    className={`sidebar-item ${activeMenu === "sharedByMe" ? "active" : ""}`}
                    onClick={() => onMenuChange("sharedByMe")}
                >
                    <span>공유한 파일</span>
                    {counts.sharedByMe > 0 && (
                        <span className="sidebar-count-badge">{counts.sharedByMe}</span>
                    )}
                </button>

                <button
                    type="button"
                    className={`sidebar-item ${activeMenu === "trash" ? "active" : ""}`}
                    onClick={() => onMenuChange("trash")}
                >
                    <span>휴지통</span>
                    {counts.trash > 0 && (
                        <span className="sidebar-count-badge">{counts.trash}</span>
                    )}
                </button>
            </nav>
        </aside>
    );
}