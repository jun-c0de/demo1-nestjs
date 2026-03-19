import { useMemo } from "react";
import { useProjectEditorStore } from "../stores/projectEditorStore";
import { moduleCatalog } from "../utils/moduleCatalog";

const leftRailItems = [
    { key: "module", label: "모듈" },
    { key: "material", label: "재질" },
    { key: "column", label: "기둥" },
    { key: "custom", label: "커스텀" },
];

const placementTabs = [
    { key: "slot", label: "슬롯배치" },
    { key: "free", label: "자유배치" },
];

const categoryTabs = ["기본장", "상부장", "하부장"];
const subTypeTabs = ["전체", "싱글", "듀얼"];

export default function ProjectEditorSidebar() {
    const placementMode = useProjectEditorStore((state) => state.placementMode);
    const selectedCategory = useProjectEditorStore((state) => state.selectedCategory);
    const selectedSubType = useProjectEditorStore((state) => state.selectedSubType);
    const selectedModule = useProjectEditorStore((state) => state.selectedModule);

    const setPlacementMode = useProjectEditorStore((state) => state.setPlacementMode);
    const setSelectedCategory = useProjectEditorStore((state) => state.setSelectedCategory);
    const setSelectedSubType = useProjectEditorStore((state) => state.setSelectedSubType);
    const setSelectedModule = useProjectEditorStore((state) => state.setSelectedModule);

    const filteredModules = useMemo(() => {
        return moduleCatalog.filter((item) => {
            const categoryMatch = item.category === selectedCategory;
            const subTypeMatch =
                selectedSubType === "전체" || item.subType === selectedSubType;
            return categoryMatch && subTypeMatch;
        });
    }, [selectedCategory, selectedSubType]);

    return (
        <div className="editor-sidebar-layout">
            <aside className="project-left-rail">
                {leftRailItems.map((item, index) => (
                    <button
                        key={item.key}
                        type="button"
                        className={`project-left-rail-btn ${index === 0 ? "active" : ""}`}
                    >
                        {item.label}
                    </button>
                ))}
            </aside>

            <aside className="project-module-panel">
                <div className="editor-tab-row">
                    {placementTabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            className={`editor-tab-btn ${placementMode === tab.key ? "active" : ""}`}
                            onClick={() => setPlacementMode(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="editor-tab-row second">
                    {categoryTabs.map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            className={`editor-tab-btn ${selectedCategory === tab ? "active" : ""}`}
                            onClick={() => setSelectedCategory(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="editor-tab-row third">
                    {subTypeTabs.map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            className={`editor-tab-btn ${selectedSubType === tab ? "active" : ""}`}
                            onClick={() => setSelectedSubType(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="editor-module-grid">
                    {filteredModules.map((module) => (
                        <button
                            key={module.id}
                            type="button"
                            className={`editor-module-card ${selectedModule?.id === module.id ? "active" : ""}`}
                            onClick={() => setSelectedModule(module)}
                            title={module.name}
                        >
                            <img
                                src={module.thumbnail}
                                alt={module.name}
                                className="editor-module-thumb-image"
                            />
                        </button>
                    ))}
                </div>
            </aside>
        </div>
    );
}