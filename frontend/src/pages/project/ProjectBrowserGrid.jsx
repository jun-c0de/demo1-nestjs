import ProjectBrowserCard from "./ProjectBrowserCard";

export default function ProjectBrowserGrid({
    folders = [],
    designs = [],
    viewMode,
    onOpenFolder,
    onOpenDesign,
}) {
    const items = [...folders, ...designs];

    if (items.length === 0) {
        return (
            <div className="project-browser-empty-state">
                <p>이 위치에는 아직 항목이 없습니다.</p>
            </div>
        );
    }

    return (
        <div className={`project-browser-grid view-${viewMode.replace(/\s+/g, "-").toLowerCase()}`}>
            {folders.map((folder) => (
                <ProjectBrowserCard
                    key={folder.id}
                    item={folder}
                    viewMode={viewMode}
                    onOpen={onOpenFolder}
                />
            ))}

            {designs.map((design) => (
                <ProjectBrowserCard
                    key={design.id || design._id}
                    item={{ ...design, type: "design" }}
                    viewMode={viewMode}
                    onOpen={onOpenDesign}
                />
            ))}
        </div>
    );
}