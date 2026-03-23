import { useEffect, useRef } from "react";
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
    const gridRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (gridRef.current && !gridRef.current.contains(event.target)) {
                onToggleMenu(null);
            }
        }

        function handleEscape(event) {
            if (event.key === "Escape") {
                onToggleMenu(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [onToggleMenu]);

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
        <div
            ref={gridRef}
            className={`project-grid view-${mapViewModeToClassName(viewMode)}`}
        >
            {projects.map((project) => {
                const projectId = project.id || project._id;

                return (
                    <ProjectCard
                        key={projectId}
                        project={project}
                        activeMenu={activeMenu}
                        isMenuOpen={openMenuProjectId === projectId}
                        onToggleMenu={onToggleMenu}
                        onRenameClick={onRenameClick}
                        onShareClick={onShareClick}
                        onMoveStatus={onMoveStatus}
                        onMoveToTrash={onMoveToTrash}
                        onDuplicate={onDuplicate}
                        onPermanentDelete={onPermanentDelete}
                        onOpenProject={onOpenProject}
                    />
                );
            })}
        </div>
    );
}