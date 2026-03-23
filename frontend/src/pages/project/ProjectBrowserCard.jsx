import { useNavigate } from "react-router-dom";

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

export default function ProjectItemCard({ projectId, item }) {
    const navigate = useNavigate();

    if (!item) return null;

    const itemId = item.id || item._id;
    const width = item.room?.width ?? 3600;
    const depth = item.room?.depth ?? 600;
    const height = item.room?.height ?? 2360;

    function handleOpenDesign() {
        if (!itemId) return;
        navigate(`/projects/${projectId}/designs/${itemId}`);
    }

    return (
        <div className="design-item-card" onClick={handleOpenDesign}>
            <div className="design-item-icon">📄</div>
            <div className="design-item-title">{item.name || "이름 없는 디자인"}</div>
            <div className="design-item-meta">
                {width} × {depth} × {height}
            </div>
            <div className="design-item-date">
                {formatDate(item.updatedAt || item.createdAt)}
            </div>
        </div>
    );
}