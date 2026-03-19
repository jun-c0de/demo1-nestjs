import ProjectItemCard from "./ProjectItemCard";

export default function ProjectItemGrid({ projectId, items = [] }) {
    if (!Array.isArray(items) || items.length === 0) {
        return (
            <div className="dashboard-empty-state">
                <div className="empty-file-icon">P</div>
                <p>항목이 없습니다</p>
            </div>
        );
    }

    return (
        <div className="project-grid">
            {items.map((item) => (
                <ProjectItemCard
                    key={item.id}
                    projectId={projectId}
                    item={item}
                />
            ))}
        </div>
    );
}