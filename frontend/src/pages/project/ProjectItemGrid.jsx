import ProjectItemCard from "./ProjectItemCard";

export default function ProjectItemGrid({ projectId, items = [] }) {
    if (!Array.isArray(items) || items.length === 0) {
        return (
            <div className="dashboard-empty-state">
                <div className="empty-file-icon">📄</div>
                <p>디자인이 없습니다</p>
            </div>
        );
    }

    return (
        <div className="project-grid">
            {items.map((item) => {
                const itemId = item.id || item._id;

                return (
                    <ProjectItemCard
                        key={itemId}
                        projectId={projectId}
                        item={item}
                    />
                );
            })}
        </div>
    );
}