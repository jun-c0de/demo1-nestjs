import { useMemo } from "react";
import { useProjectEditorStore } from "../stores/projectEditorStore";
import {
    getCanvasRoomRect,
    getColumnSlots,
    getInnerHeight,
    getInnerWidth,
    getPlacedModuleAtSlot,
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

function FrontModuleFigure({ x, y, width, height, moduleName, editorData }) {
    const bodyX = x + 8;
    const bodyY = y + 8;
    const bodyW = width - 16;
    const bodyH = height - 16;

    const topBoxH = Math.max(34, bodyH * 0.12);
    const hangingTopY = bodyY + topBoxH + 8;
    const hangingBottomY = bodyY + bodyH - 110;

    const drawer1Y = bodyY + bodyH - 92;
    const drawer2Y = bodyY + bodyH - 46;

    const showDoor = editorData.doorMode === "install";
    const isOpen = editorData.doorOpenState === "open";

    return (
        <g>
            <rect
                x={bodyX}
                y={bodyY}
                width={bodyW}
                height={bodyH}
                className="module-figure-outer"
            />

            <line
                x1={bodyX}
                y1={bodyY + topBoxH}
                x2={bodyX + bodyW}
                y2={bodyY + topBoxH}
                className="module-figure-line"
            />

            <line
                x1={bodyX + 10}
                y1={hangingTopY}
                x2={bodyX + bodyW - 10}
                y2={hangingTopY}
                className="module-hanger-line"
            />

            <rect
                x={bodyX + 5}
                y={drawer1Y}
                width={bodyW - 10}
                height={38}
                className="module-drawer-box"
            />

            <rect
                x={bodyX + 5}
                y={drawer2Y}
                width={bodyW - 10}
                height={34}
                className="module-drawer-box"
            />

            {showDoor && !isOpen && (
                <line
                    x1={bodyX + bodyW - 8}
                    y1={hangingTopY + 6}
                    x2={bodyX + bodyW - 8}
                    y2={hangingBottomY}
                    className="module-door-line-closed"
                />
            )}

            {showDoor && isOpen && (
                <line
                    x1={bodyX + bodyW - 8}
                    y1={hangingTopY + 6}
                    x2={bodyX + bodyW + 16}
                    y2={hangingTopY + 70}
                    className="module-door-line-open"
                />
            )}

            {!showDoor && (
                <line
                    x1={bodyX + bodyW - 8}
                    y1={hangingTopY + 6}
                    x2={bodyX + bodyW + 12}
                    y2={hangingTopY + 52}
                    className="module-door-line-removed"
                />
            )}

            <text
                x={bodyX + bodyW / 2}
                y={bodyY + bodyH + 20}
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

    const rect = getCanvasRoomRect();
    const innerWidth = getInnerWidth(room, editorData);
    const innerHeight = getInnerHeight(room, editorData);
    const slots = getColumnSlots(room, editorData);

    const centerX = rect.innerX + rect.innerW / 2;
    const floorY = rect.innerY + rect.innerH + 14;

    const slotRects = useMemo(() => {
        return slots.map((slot, index) => {
            const x = rect.innerX + (rect.innerW / editorData.columnCount) * index;
            const width = rect.innerW / editorData.columnCount;
            return { ...slot, x, width };
        });
    }, [slots, rect.innerX, rect.innerW, editorData.columnCount]);

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
                    <div className="editor-view-toggle">
                        <button
                            type="button"
                            className={`editor-view-btn ${editorData.doorMode === "remove" ? "active" : ""}`}
                            onClick={() => setEditorField("doorMode", "remove")}
                        >
                            도어제거
                        </button>
                        <button
                            type="button"
                            className={`editor-view-btn ${editorData.doorMode === "install" ? "active" : ""}`}
                            onClick={() => setEditorField("doorMode", "install")}
                        >
                            도어설치
                        </button>
                    </div>

                    <div className="editor-view-toggle">
                        <button
                            type="button"
                            className={`editor-view-btn ${editorData.viewDirection === "front" ? "active" : ""}`}
                            onClick={() => setEditorField("viewDirection", "front")}
                        >
                            입면
                        </button>
                        <button
                            type="button"
                            className={`editor-view-btn ${editorData.viewDirection === "top" ? "active" : ""}`}
                            onClick={() => setEditorField("viewDirection", "top")}
                        >
                            평면
                        </button>
                        <button
                            type="button"
                            className={`editor-view-btn ${editorData.viewDirection === "side" ? "active" : ""}`}
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
                        x1={rect.outerX}
                        y1={rect.outerY - 16}
                        x2={rect.outerX + rect.outerW}
                        y2={rect.outerY - 16}
                        className="editor-dim-line"
                    />
                    <line
                        x1={rect.outerX}
                        y1={rect.outerY - 28}
                        x2={rect.outerX}
                        y2={rect.outerY + 10}
                        className="editor-dim-line"
                    />
                    <line
                        x1={rect.outerX + rect.outerW}
                        y1={rect.outerY - 28}
                        x2={rect.outerX + rect.outerW}
                        y2={rect.outerY + 10}
                        className="editor-dim-line"
                    />
                    <text
                        x={rect.outerX + rect.outerW / 2}
                        y={rect.outerY - 20}
                        textAnchor="middle"
                        className="editor-dim-text strong"
                    >
                        {room.width}
                    </text>

                    <line
                        x1={rect.innerX}
                        y1={rect.outerY + 6}
                        x2={rect.innerX + rect.innerW}
                        y2={rect.outerY + 6}
                        className="editor-dim-line thin"
                    />
                    <line
                        x1={rect.innerX}
                        y1={rect.outerY - 2}
                        x2={rect.innerX}
                        y2={rect.innerY}
                        className="editor-dim-line thin"
                    />
                    <line
                        x1={rect.innerX + rect.innerW}
                        y1={rect.outerY - 2}
                        x2={rect.innerX + rect.innerW}
                        y2={rect.innerY}
                        className="editor-dim-line thin"
                    />
                    <text
                        x={rect.innerX + rect.innerW / 2}
                        y={rect.outerY + 2}
                        textAnchor="middle"
                        className="editor-dim-text"
                    >
                        {innerWidth}
                    </text>

                    <rect
                        x={rect.outerX}
                        y={rect.outerY}
                        width={rect.outerW}
                        height={rect.outerH}
                        className="editor-room-outer"
                    />

                    <rect
                        x={rect.innerX}
                        y={rect.innerY}
                        width={rect.innerW}
                        height={rect.innerH}
                        className="editor-room-inner-reference"
                    />

                    <line
                        x1={rect.outerX - 46}
                        y1={rect.outerY}
                        x2={rect.outerX - 46}
                        y2={rect.outerY + rect.outerH}
                        className="editor-dim-line"
                    />
                    <line
                        x1={rect.outerX - 56}
                        y1={rect.outerY}
                        x2={rect.outerX + 2}
                        y2={rect.outerY}
                        className="editor-dim-line"
                    />
                    <line
                        x1={rect.outerX - 56}
                        y1={rect.outerY + rect.outerH}
                        x2={rect.outerX + 2}
                        y2={rect.outerY + rect.outerH}
                        className="editor-dim-line"
                    />
                    <text
                        x={rect.outerX - 58}
                        y={rect.outerY + rect.outerH / 2}
                        textAnchor="middle"
                        className="editor-dim-text strong"
                    >
                        {room.height}
                    </text>

                    <line
                        x1={rect.innerX - 22}
                        y1={rect.innerY}
                        x2={rect.innerX - 22}
                        y2={rect.innerY + rect.innerH}
                        className="editor-dim-line thin"
                    />
                    <line
                        x1={rect.innerX - 30}
                        y1={rect.innerY}
                        x2={rect.innerX + 2}
                        y2={rect.innerY}
                        className="editor-dim-line thin"
                    />
                    <line
                        x1={rect.innerX - 30}
                        y1={rect.innerY + rect.innerH}
                        x2={rect.innerX + 2}
                        y2={rect.innerY + rect.innerH}
                        className="editor-dim-line thin"
                    />
                    <text
                        x={rect.innerX - 28}
                        y={rect.innerY + rect.innerH / 2}
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
                                    y={rect.innerY}
                                    width={slot.width}
                                    height={rect.innerH}
                                    className={`editor-slot-hitbox ${selectedSlotIndex === index ? "selected" : ""}`}
                                    onClick={() => handleSlotClick(index)}
                                />

                                {index > 0 && (
                                    <line
                                        x1={slot.x}
                                        y1={rect.innerY}
                                        x2={slot.x}
                                        y2={rect.innerY + rect.innerH}
                                        className="editor-slot-divider"
                                    />
                                )}

                                <text
                                    x={slot.x + slot.width / 2}
                                    y={rect.innerY + rect.innerH / 2}
                                    textAnchor="middle"
                                    className="editor-slot-width-text"
                                >
                                    {slot.width}
                                </text>

                                {placedModule && (
                                    <>
                                        <FrontModuleFigure
                                            x={slot.x}
                                            y={rect.innerY}
                                            width={slot.width}
                                            height={rect.innerH}
                                            moduleName={placedModule.moduleName}
                                            editorData={editorData}
                                        />

                                        <circle
                                            cx={slot.x + slot.width / 2}
                                            cy={rect.innerY + rect.innerH + 34}
                                            r="13"
                                            className="module-remove-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeModuleFromSlot(index);
                                            }}
                                        />
                                        <text
                                            x={slot.x + slot.width / 2}
                                            y={rect.innerY + rect.innerH + 39}
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
                        x1={rect.innerX + rect.innerW}
                        y1={rect.innerY}
                        x2={rect.innerX + rect.innerW}
                        y2={rect.innerY + rect.innerH}
                        className="editor-slot-divider"
                    />

                    <text
                        x={rect.outerX + 22}
                        y={rect.outerY + 42}
                        className="editor-small-text"
                    >
                        {editorData.leftFrame}
                    </text>

                    <text
                        x={rect.outerX + rect.outerW - 18}
                        y={rect.outerY + 42}
                        className="editor-small-text"
                    >
                        {editorData.rightFrame}
                    </text>

                    <text
                        x={rect.outerX - 2}
                        y={rect.outerY + 52}
                        className="editor-small-text"
                    >
                        {editorData.topFrame}
                    </text>

                    <text
                        x={rect.innerX - 8}
                        y={rect.outerY + rect.outerH - 4}
                        className="editor-small-text"
                    >
                        {editorData.baseHeight}
                    </text>
                </svg>
            </div>
        </main>
    );
}