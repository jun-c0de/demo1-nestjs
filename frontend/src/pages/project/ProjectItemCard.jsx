import { useNavigate } from "react-router";

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

export default function ProjectItemCard({ projectId, item }) {
    const navigate = useNavigate();

    return (
        <div
            className="design-item-card"
            onClick={() => navigate(`/projects/${projectId}/designs/${item.id}`)}
        >
            <div className="design-item-icon">📄</div>

            <div className="design-item-title">{item.name}</div>

            <div className="design-item-meta">
                {item.room?.width ?? 3600} × {item.room?.depth ?? 600} × {item.room?.height ?? 2360}
            </div>

            <div className="design-item-date">{formatDate(item.createdAt)}</div>
        </div>
    );
}