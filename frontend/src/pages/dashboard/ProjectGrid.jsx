import ProjectCard from "./ProjectCard";

function mapViewModeToClassName(viewMode) {
    return viewMode.replace(/\s+/g, "-");
}

export default function ProjectGrid({
    projects = [],
    isLoading,
    viewMode,
    activeMenu,
    openMenuProjectId,
    onToggleMenu,
    onRenameClick,
    onShareClick,
    onMoveStatus,
    onMoveToTrash,
    onDuplicate,
    onPermanentDelete,
    onOpenProject,
}) {
    if (isLoading) {
        return (
            <div className="dashboard-empty-state">
                <div className="empty-file-icon">…</div>
                <p>프로젝트 불러오는 중...</p>
            </div>
        );
    }

    if (!Array.isArray(projects) || projects.length === 0) {
        return (
            <div className="dashboard-empty-state">
                <div className="empty-file-icon">P</div>
                <p>항목이 없습니다</p>
            </div>
        );
    }

    return (
        <div className={`project-grid view-${mapViewModeToClassName(viewMode)}`}>
            {projects.map((project) => (
                <ProjectCard
                    key={project.id}
                    project={project}
                    activeMenu={activeMenu}
                    isMenuOpen={openMenuProjectId === project.id}
                    onToggleMenu={onToggleMenu}
                    onRenameClick={onRenameClick}
                    onShareClick={onShareClick}
                    onMoveStatus={onMoveStatus}
                    onMoveToTrash={onMoveToTrash}
                    onDuplicate={onDuplicate}
                    onPermanentDelete={onPermanentDelete}
                    onOpenProject={onOpenProject}
                />
            ))}
        </div>
    );
}