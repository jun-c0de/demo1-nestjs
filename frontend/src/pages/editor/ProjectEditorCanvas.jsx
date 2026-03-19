import { useMemo } from "react";
import { useProjectEditorStore } from "../stores/projectEditorStore";
import {
    getInnerHeight,
    getInnerWidth,
    getPlacedModuleAtSlot,
    getScaledLayout,
    getScaledSlotRects,
} from "../utils/projectEditorMath";

function SideTools() {
    return (
        <div className="editor-side-tools">
            <button type="button" className="editor-side-tool-btn">?</button>
            <button type="button" className="editor-side-tool-btn">📋</button>
            <button type="button" className="editor-side-tool-btn">⌫</button>
            <button type="button" className="editor-side-tool-btn">☀</button>
        </div>
    );
}

function FrontModuleFigure({ slot, moduleName, editorData }) {
    const { x, y, width, height } = slot;

    const bodyX = x + 6;
    const bodyY = y + 6;
    const bodyW = width - 12;
    const bodyH = height - 12;

    const baseZoneH = Math.max(30, Math.min(bodyH * 0.28, bodyH - 80));
    const topBoxH = Math.max(26, Math.min(bodyH * 0.12, 46));

    const hangingTopY = bodyY + topBoxH + 6;
    const hangingBottomY = bodyY + bodyH - baseZoneH - 4;

    const drawer1H = Math.max(24, baseZoneH * 0.48);
    const drawer2H = Math.max(20, baseZoneH * 0.38);

    const drawer2Y = bodyY + bodyH - 4 - drawer2H;
    const drawer1Y = drawer2Y - drawer1H - 4;

    const showDoor = editorData.doorInstalled;
    const isOpen = editorData.doorOpenState === "open";

    return (
        <g>
            <rect
                x={bodyX}
                y={bodyY}
                width={bodyW}
                height={bodyH}
                className={`module-figure-outer ${editorData.placementType === "floating" ? "floating" : ""
                    }`}
            />

            <line
                x1={bodyX}
                y1={bodyY + topBoxH}
                x2={bodyX + bodyW}
                y2={bodyY + topBoxH}
                className="module-figure-line"
            />

            <line
                x1={bodyX + 8}
                y1={hangingTopY}
                x2={bodyX + bodyW - 8}
                y2={hangingTopY}
                className="module-hanger-line"
            />

            <rect
                x={bodyX + 4}
                y={drawer1Y}
                width={bodyW - 8}
                height={drawer1H}
                className="module-drawer-box"
            />

            <rect
                x={bodyX + 4}
                y={drawer2Y}
                width={bodyW - 8}
                height={drawer2H}
                className="module-drawer-box"
            />

            {showDoor && !isOpen && (
                <line
                    x1={bodyX + bodyW - 6}
                    y1={hangingTopY + 4}
                    x2={bodyX + bodyW - 6}
                    y2={hangingBottomY}
                    className="module-door-line-closed"
                />
            )}

            {showDoor && isOpen && (
                <line
                    x1={bodyX + bodyW - 6}
                    y1={hangingTopY + 4}
                    x2={bodyX + bodyW + 14}
                    y2={hangingTopY + 60}
                    className="module-door-line-open"
                />
            )}

            {!showDoor && (
                <line
                    x1={bodyX + bodyW - 6}
                    y1={hangingTopY + 4}
                    x2={bodyX + bodyW + 10}
                    y2={hangingTopY + 44}
                    className="module-door-line-removed"
                />
            )}

            <text
                x={bodyX + bodyW / 2}
                y={bodyY + bodyH + 18}
                textAnchor="middle"
                className="module-name-text"
            >
                {moduleName}
            </text>
        </g>
    );
}

export default function ProjectEditorCanvas() {
    const room = useProjectEditorStore((state) => state.room);
    const editorData = useProjectEditorStore((state) => state.editorData);
    const viewMode = useProjectEditorStore((state) => state.viewMode);
    const selectedSlotIndex = useProjectEditorStore((state) => state.selectedSlotIndex);
    const selectedModule = useProjectEditorStore((state) => state.selectedModule);

    const setViewMode = useProjectEditorStore((state) => state.setViewMode);
    const setEditorField = useProjectEditorStore((state) => state.setEditorField);
    const setSelectedSlotIndex = useProjectEditorStore((state) => state.setSelectedSlotIndex);
    const placeModuleInSlot = useProjectEditorStore((state) => state.placeModuleInSlot);
    const removeModuleFromSlot = useProjectEditorStore((state) => state.removeModuleFromSlot);
    const installDoor = useProjectEditorStore((state) => state.installDoor);
    const removeDoor = useProjectEditorStore((state) => state.removeDoor);

    const innerWidth = Math.round(getInnerWidth(room, editorData));
    const innerHeight = Math.round(getInnerHeight(room, editorData));
    const layout = getScaledLayout(room, editorData);

    const slotRects = useMemo(() => {
        return getScaledSlotRects(room, editorData);
    }, [room, editorData]);

    const hasPlacedModules = editorData.modules.length > 0;

    const centerX = layout.innerX + layout.innerW / 2;
    const floorY =
        editorData.placementType === "floating"
            ? layout.rect.outerY + layout.rect.outerH + 28
            : layout.rect.outerY + layout.rect.outerH + 14;

    function handleSlotClick(slotIndex) {
        setSelectedSlotIndex(slotIndex);
        if (selectedModule) {
            placeModuleInSlot(slotIndex);
        }
    }

    return (
        <main className="project-canvas-area">
            <div className="project-canvas-toolbar">
                <div className="canvas-toolbar-left">
                    <label className="canvas-switch-row">
                        <span>ON</span>
                        <button type="button" className="canvas-toggle-switch active" />
                    </label>

                    <select className="canvas-select" defaultValue="표시">
                        <option>표시</option>
                    </select>

                    <div className="editor-view-toggle compact">
                        <button
                            type="button"
                            className={`editor-view-btn ${viewMode === "3d" ? "active" : ""}`}
                            onClick={() => setViewMode("3d")}
                        >
                            3D
                        </button>
                        <button
                            type="button"
                            className={`editor-view-btn ${viewMode === "2d" ? "active" : ""}`}
                            onClick={() => setViewMode("2d")}
                        >
                            2D
                        </button>
                    </div>
                </div>

                <div className="canvas-toolbar-center">
                    {hasPlacedModules && (
                        <div className="editor-toolbar-door-area">
                            {!editorData.doorInstalled ? (
                                <button
                                    type="button"
                                    className="editor-view-btn active"
                                    onClick={installDoor}
                                >
                                    도어설치
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="editor-view-btn active"
                                    onClick={removeDoor}
                                >
                                    도어제거
                                </button>
                            )}
                        </div>
                    )}

                    <div className="editor-view-toggle">
                        <button
                            type="button"
                            className={`editor-view-btn ${editorData.viewDirection === "front" ? "active" : ""
                                }`}
                            onClick={() => setEditorField("viewDirection", "front")}
                        >
                            입면
                        </button>
                        <button
                            type="button"
                            className={`editor-view-btn ${editorData.viewDirection === "top" ? "active" : ""
                                }`}
                            onClick={() => setEditorField("viewDirection", "top")}
                        >
                            평면
                        </button>
                        <button
                            type="button"
                            className={`editor-view-btn ${editorData.viewDirection === "side" ? "active" : ""
                                }`}
                            onClick={() => setEditorField("viewDirection", "side")}
                        >
                            측면
                        </button>
                    </div>
                </div>

                <div className="canvas-toolbar-right">
                    <button type="button" className="canvas-help-btn">?</button>
                </div>
            </div>

            <div className="project-canvas-stage canvas-stage-grid">
                <SideTools />

                {hasPlacedModules && editorData.doorInstalled && (
                    <div className="editor-door-floating-controls">
                        <button
                            type="button"
                            className={`editor-door-state-btn ${editorData.doorOpenState === "close" ? "active" : ""
                                }`}
                            onClick={() => setEditorField("doorOpenState", "close")}
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            className={`editor-door-state-btn ${editorData.doorOpenState === "open" ? "active" : ""
                                }`}
                            onClick={() => setEditorField("doorOpenState", "open")}
                        >
                            Open
                        </button>
                    </div>
                )}

                <svg
                    className="project-editor-svg"
                    viewBox="0 0 1100 760"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <line
                        x1={centerX}
                        y1="24"
                        x2={centerX}
                        y2="732"
                        className="editor-center-guide"
                    />

                    <line
                        x1="36"
                        y1={floorY}
                        x2="1064"
                        y2={floorY}
                        className="editor-floor-guide"
                    />

                    <line
                        x1={layout.rect.outerX}
                        y1={layout.rect.outerY - 16}
                        x2={layout.rect.outerX + layout.rect.outerW}
                        y2={layout.rect.outerY - 16}
                        className="editor-dim-line"
                    />
                    <line
                        x1={layout.rect.outerX}
                        y1={layout.rect.outerY - 28}
                        x2={layout.rect.outerX}
                        y2={layout.rect.outerY + 10}
                        className="editor-dim-line"
                    />
                    <line
                        x1={layout.rect.outerX + layout.rect.outerW}
                        y1={layout.rect.outerY - 28}
                        x2={layout.rect.outerX + layout.rect.outerW}
                        y2={layout.rect.outerY + 10}
                        className="editor-dim-line"
                    />
                    <text
                        x={layout.rect.outerX + layout.rect.outerW / 2}
                        y={layout.rect.outerY - 20}
                        textAnchor="middle"
                        className="editor-dim-text strong"
                    >
                        {Math.round(room.width)}
                    </text>

                    <line
                        x1={layout.innerX}
                        y1={layout.rect.outerY + 6}
                        x2={layout.innerX + layout.innerW}
                        y2={layout.rect.outerY + 6}
                        className="editor-dim-line thin"
                    />
                    <line
                        x1={layout.innerX}
                        y1={layout.rect.outerY - 2}
                        x2={layout.innerX}
                        y2={layout.innerY}
                        className="editor-dim-line thin"
                    />
                    <line
                        x1={layout.innerX + layout.innerW}
                        y1={layout.rect.outerY - 2}
                        x2={layout.innerX + layout.innerW}
                        y2={layout.innerY}
                        className="editor-dim-line thin"
                    />
                    <text
                        x={layout.innerX + layout.innerW / 2}
                        y={layout.rect.outerY + 2}
                        textAnchor="middle"
                        className="editor-dim-text"
                    >
                        {innerWidth}
                    </text>

                    <rect
                        x={layout.rect.outerX}
                        y={layout.rect.outerY}
                        width={layout.rect.outerW}
                        height={layout.rect.outerH}
                        className="editor-room-outer"
                    />

                    <rect
                        x={layout.innerX}
                        y={layout.innerY}
                        width={layout.innerW}
                        height={layout.innerH}
                        className={`editor-room-inner-reference ${editorData.placementType === "floating" ? "floating" : ""
                            }`}
                    />

                    <line
                        x1={layout.rect.outerX - 46}
                        y1={layout.rect.outerY}
                        x2={layout.rect.outerX - 46}
                        y2={layout.rect.outerY + layout.rect.outerH}
                        className="editor-dim-line"
                    />
                    <line
                        x1={layout.rect.outerX - 56}
                        y1={layout.rect.outerY}
                        x2={layout.rect.outerX + 2}
                        y2={layout.rect.outerY}
                        className="editor-dim-line"
                    />
                    <line
                        x1={layout.rect.outerX - 56}
                        y1={layout.rect.outerY + layout.rect.outerH}
                        x2={layout.rect.outerX + 2}
                        y2={layout.rect.outerY + layout.rect.outerH}
                        className="editor-dim-line"
                    />
                    <text
                        x={layout.rect.outerX - 58}
                        y={layout.rect.outerY + layout.rect.outerH / 2}
                        textAnchor="middle"
                        className="editor-dim-text strong"
                    >
                        {Math.round(room.height)}
                    </text>

                    <line
                        x1={layout.innerX - 22}
                        y1={layout.innerY}
                        x2={layout.innerX - 22}
                        y2={layout.innerY + layout.innerH}
                        className="editor-dim-line thin"
                    />
                    <line
                        x1={layout.innerX - 30}
                        y1={layout.innerY}
                        x2={layout.innerX + 2}
                        y2={layout.innerY}
                        className="editor-dim-line thin"
                    />
                    <line
                        x1={layout.innerX - 30}
                        y1={layout.innerY + layout.innerH}
                        x2={layout.innerX + 2}
                        y2={layout.innerY + layout.innerH}
                        className="editor-dim-line thin"
                    />
                    <text
                        x={layout.innerX - 28}
                        y={layout.innerY + layout.innerH / 2}
                        textAnchor="middle"
                        className="editor-dim-text"
                    >
                        {innerHeight}
                    </text>

                    {slotRects.map((slot, index) => {
                        const placedModule = getPlacedModuleAtSlot(editorData.modules, index);

                        return (
                            <g key={slot.index}>
                                <rect
                                    x={slot.x}
                                    y={slot.y}
                                    width={slot.width}
                                    height={slot.height}
                                    className={`editor-slot-hitbox ${selectedSlotIndex === index ? "selected" : ""
                                        }`}
                                    onClick={() => handleSlotClick(index)}
                                />

                                {index > 0 && (
                                    <line
                                        x1={slot.x}
                                        y1={slot.y}
                                        x2={slot.x}
                                        y2={slot.y + slot.height}
                                        className="editor-slot-divider"
                                    />
                                )}

                                <text
                                    x={slot.x + slot.width / 2}
                                    y={slot.y + slot.height / 2}
                                    textAnchor="middle"
                                    className="editor-slot-width-text"
                                >
                                    {slot.displayWidth}
                                </text>

                                {placedModule && (
                                    <>
                                        <FrontModuleFigure
                                            slot={slot}
                                            moduleName={placedModule.moduleName}
                                            editorData={editorData}
                                        />

                                        <circle
                                            cx={slot.x + slot.width / 2}
                                            cy={slot.y + slot.height + 34}
                                            r="13"
                                            className="module-remove-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeModuleFromSlot(index);
                                            }}
                                        />
                                        <text
                                            x={slot.x + slot.width / 2}
                                            y={slot.y + slot.height + 39}
                                            textAnchor="middle"
                                            className="module-remove-btn-text"
                                        >
                                            ×
                                        </text>
                                    </>
                                )}
                            </g>
                        );
                    })}

                    <line
                        x1={layout.innerX + layout.innerW}
                        y1={layout.innerY}
                        x2={layout.innerX + layout.innerW}
                        y2={layout.innerY + layout.innerH}
                        className="editor-slot-divider"
                    />

                    <text
                        x={layout.rect.outerX + layout.leftFramePx / 2}
                        y={layout.rect.outerY + 42}
                        textAnchor="middle"
                        className="editor-small-text"
                    >
                        {Math.round(editorData.leftFrame)}
                    </text>

                    <text
                        x={layout.rect.outerX + layout.rect.outerW - layout.rightFramePx / 2}
                        y={layout.rect.outerY + 42}
                        textAnchor="middle"
                        className="editor-small-text"
                    >
                        {Math.round(editorData.rightFrame)}
                    </text>

                    <text
                        x={layout.rect.outerX - 8}
                        y={layout.rect.outerY + layout.topFramePx / 2 + 10}
                        className="editor-small-text"
                    >
                        {Math.round(editorData.topFrame)}
                    </text>

                    <text
                        x={layout.innerX - 12}
                        y={layout.rect.outerY + layout.rect.outerH - layout.baseHeightPx / 2}
                        className="editor-small-text"
                    >
                        {Math.round(editorData.baseHeight)}
                    </text>
                </svg>
            </div>
        </main>
    );
}