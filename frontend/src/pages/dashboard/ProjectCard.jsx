import { useNavigate } from "react-router";
import ProjectContextMenu from "./ProjectContextMenu";

function formatDate(dateString) {
    const date = new Date(dateString);

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
}) {
    const navigate = useNavigate();

    return (
        <div
            className="project-card"
            onClick={() => navigate(`/projects/${project.id}`)}
            onContextMenu={(e) => {
                e.preventDefault();
                onToggleMenu((prev) => (prev === project.id ? null : project.id));
            }}
        >
            <div className="project-card-icon">P</div>
            <div className="project-card-title">{project.title}</div>
            <div className="project-card-meta">{project.fileCount}개 파일</div>
            <div className="project-card-date">{formatDate(project.createdAt)}</div>

            {isMenuOpen && (
                <div onClick={(e) => e.stopPropagation()}>
                    <ProjectContextMenu
                        project={project}
                        activeMenu={activeMenu}
                        onRenameClick={onRenameClick}
                        onShareClick={onShareClick}
                        onMoveStatus={onMoveStatus}
                        onMoveToTrash={onMoveToTrash}
                        onDuplicate={onDuplicate}
                        onPermanentDelete={onPermanentDelete}
                    />
                </div>
            )}
        </div>
    );
}