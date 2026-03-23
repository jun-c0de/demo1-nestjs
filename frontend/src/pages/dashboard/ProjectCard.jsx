import ProjectContextMenu from "./ProjectContextMenu";

function formatDate(dateString) {
    if (!dateString) return "-";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function ProjectCard({
    project,
    activeMenu,
    isMenuOpen,
    onToggleMenu,
    onRenameClick,
    onShareClick,
    onMoveStatus,
    onMoveToTrash,
    onDuplicate,
    onPermanentDelete,
    onOpenProject,
}) {
    const projectId = project?.id || project?._id;

    function toggleMenu(e) {
        e.preventDefault();
        e.stopPropagation();
        onToggleMenu((prev) => (prev === projectId ? null : projectId));
    }

    function handleOpenProject() {
        if (isMenuOpen) return;
        onOpenProject?.(project);
    }

    return (
        <div
            className={`project-card ${isMenuOpen ? "project-card-menu-open" : ""}`}
            onClick={handleOpenProject}
            onContextMenu={toggleMenu}
        >
            <button
                type="button"
                className="project-card-menu-btn"
                onClick={toggleMenu}
                aria-label="프로젝트 메뉴 열기"
            >
                ⋯
            </button>

            <div className="project-card-icon">P</div>
            <div className="project-card-title">{project?.title || "이름 없는 프로젝트"}</div>
            <div className="project-card-meta">{project?.fileCount ?? 0}개 파일</div>
            <div className="project-card-date">
                {formatDate(project?.createdAt || project?.updatedAt)}
            </div>

            {isMenuOpen && (
                <div
                    className="project-card-menu-wrap"
                    onClick={(e) => e.stopPropagation()}
                    onContextMenu={(e) => e.stopPropagation()}
                >
                    <ProjectContextMenu
                        project={project}
                        activeMenu={activeMenu}
                        onRenameClick={onRenameClick}
                        onShareClick={onShareClick}
                        onMoveStatus={onMoveStatus}
                        onMoveToTrash={onMoveToTrash}
                        onDuplicate={onDuplicate}
                        onPermanentDelete={onPermanentDelete}
                        onClose={() => onToggleMenu(null)}
                    />
                </div>
            )}
        </div>
    );
}