export function getInnerWidth(room, editorData) {
    return Math.max(
        0,
        room.width - (editorData.leftFrame || 0) - (editorData.rightFrame || 0)
    );
}

export function getInnerHeight(room, editorData) {
    return Math.max(
        0,
        room.height - (editorData.topFrame || 0) - (editorData.baseHeight || 0)
    );
}

export function getColumnWidth(room, editorData) {
    const columnCount = editorData.columnCount || 1;
    const innerWidth = getInnerWidth(room, editorData);
    return Math.floor(innerWidth / columnCount);
}

export function getColumnSlots(room, editorData) {
    const columnCount = editorData.columnCount || 1;
    const columnWidth = getColumnWidth(room, editorData);

    return Array.from({ length: columnCount }, (_, index) => ({
        index,
        width: columnWidth,
        x: index * columnWidth,
    }));
}

export function getPlacedModuleAtSlot(modules, slotIndex) {
    return modules.find((item) => item.slotIndex === slotIndex) || null;
}

export function getCanvasRoomRect() {
    return {
        outerX: 180,
        outerY: 150,
        outerW: 740,
        outerH: 470,
        innerX: 220,
        innerY: 185,
        innerW: 660,
        innerH: 395,
    };
}