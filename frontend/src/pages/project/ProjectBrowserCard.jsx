import { Folder, FileText } from "lucide-react";

function formatDate(dateString) {
    if (!dateString) return "-";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function ProjectBrowserCard({ item, viewMode, onOpen }) {
    if (!item) return null;

    const isFolder = item.type === "folder";
    const title = item.name || item.title || "이름 없음";
    const updatedAt = item.updatedAt || item.createdAt;
    const sizeText = isFolder
        ? `${item.childrenCount ?? 0}개 항목`
        : `${item.room?.width ?? 3600} × ${item.room?.depth ?? 600} × ${item.room?.height ?? 2360}`;

    return (
        <button
            type="button"
            className={`project-browser-card view-${viewMode.replace(/\s+/g, "-").toLowerCase()}`}
            onClick={() => onOpen(item)}
        >
            <div className="project-browser-card__icon">
                {isFolder ? <Folder size={20} /> : <FileText size={20} />}
            </div>

            <div className="project-browser-card__content">
                <strong>{title}</strong>
                <span>{sizeText}</span>
                <span>{formatDate(updatedAt)}</span>
            </div>
        </button>
    );
}