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

function getOwnerText(project) {
    if (project?.shareType === "withMe") {
        return project?.ownerName || project?.ownerEmail || "공유받은 프로젝트";
    }

    if (project?.shareType === "byMe") {
        return project?.ownerName || project?.ownerEmail || "내가 공유한 프로젝트";
    }

    return "";
}

function mapViewModeToCardClass(viewMode = "") {
    if (viewMode === "목록") return "is-list";
    if (viewMode === "자세히") return "is-detail";
    return "is-grid";
}

export default function ProjectCard({
    project,
    activeMenu,
    isMenuOpen,
    viewMode,
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
    const ownerText = getOwnerText(project);

    function toggleMenu(event) {
        event.preventDefault();
        event.stopPropagation();
        onToggleMenu((prev) => (prev === projectId ? null : projectId));
    }

    function handleOpenProject() {
        if (isMenuOpen) return;
        onOpenProject?.(project);
    }

    function handleKeyDown(event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleOpenProject();
        }
    }

    return (
        <article
            className={`project-card ${mapViewModeToCardClass(viewMode)} ${isMenuOpen ? "project-card--menu-open" : ""
                }`}
            role="button"
            tabIndex={0}
            onClick={handleOpenProject}
            onKeyDown={handleKeyDown}
        >
            <button
                type="button"
                className="project-card__menu-btn"
                aria-label="프로젝트 메뉴 열기"
                onClick={toggleMenu}
            >
                ⋯
            </button>

            <div className="project-card__thumb" aria-hidden="true">
                <span className="project-card__thumb-letter">
                    {(project?.title || "P").charAt(0).toUpperCase()}
                </span>
            </div>

            <div className="project-card__body">
                <h3 className="project-card__title">
                    {project?.title || "이름 없는 프로젝트"}
                </h3>

                <div className="project-card__meta-row">
                    <span className="project-card__file-count">
                        {project?.fileCount ?? 0}개 파일
                    </span>
                    {ownerText ? (
                        <span className="project-card__share-badge">{ownerText}</span>
                    ) : null}
                </div>

                <p className="project-card__date">
                    {formatDate(project?.updatedAt || project?.createdAt)}
                </p>
            </div>

            {isMenuOpen && (
                <div
                    className="project-card__menu-wrap"
                    onClick={(event) => event.stopPropagation()}
                    onContextMenu={(event) => event.stopPropagation()}
                >
                    <ProjectContextMenu
                        activeMenu={activeMenu}
                        project={project}
                        onRenameClick={() => onRenameClick?.(project)}
                        onShareClick={() => onShareClick?.(project)}
                        onMoveStatus={onMoveStatus}
                        onMoveToTrash={onMoveToTrash}
                        onDuplicate={onDuplicate}
                        onPermanentDelete={onPermanentDelete}
                        onClose={() => onToggleMenu(null)}
                    />
                </div>
            )}
        </article>
    );
}