import { useEffect, useRef } from "react";
import ProjectCard from "./ProjectCard";

function mapViewModeToClassName(viewMode = "") {
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
            <div className="project-grid project-grid--loading">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="project-card project-card--skeleton">
                        <div className="project-card__thumb project-card__thumb--skeleton" />
                        <div className="project-card__line project-card__line--title" />
                        <div className="project-card__line project-card__line--meta" />
                        <div className="project-card__line project-card__line--date" />
                    </div>
                ))}
            </div>
        );
    }

    if (!Array.isArray(projects) || projects.length === 0) {
        return (
            <div className="project-grid-empty">
                <div className="project-grid-empty__icon">P</div>
                <p className="project-grid-empty__text">항목이 없습니다</p>
            </div>
        );
    }

    return (
        <div
            ref={gridRef}
            className={`project-grid project-grid--${mapViewModeToClassName(viewMode)}`}
        >
            {projects.map((project) => {
                const projectId = project.id || project._id;

                return (
                    <ProjectCard
                        key={projectId}
                        project={project}
                        activeMenu={activeMenu}
                        isMenuOpen={openMenuProjectId === projectId}
                        viewMode={viewMode}
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