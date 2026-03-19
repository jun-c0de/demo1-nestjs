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
    return innerWidth / columnCount;
}

export function getColumnSlots(room, editorData) {
    const columnCount = editorData.columnCount || 1;
    const innerWidth = getInnerWidth(room, editorData);
    const columnWidth = innerWidth / columnCount;

    return Array.from({ length: columnCount }, (_, index) => ({
        index,
        width: columnWidth,
        displayWidth: Math.round(columnWidth),
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

export function getScaledLayout(room, editorData) {
    const rect = getCanvasRoomRect();

    const roomWidth = Math.max(room.width, 1);
    const roomHeight = Math.max(room.height, 1);

    const scaleX = rect.outerW / roomWidth;
    const scaleY = rect.outerH / roomHeight;

    const leftFramePx = (editorData.leftFrame || 0) * scaleX;
    const rightFramePx = (editorData.rightFrame || 0) * scaleX;
    const topFramePx = (editorData.topFrame || 0) * scaleY;
    const baseHeightPx = (editorData.baseHeight || 0) * scaleY;

    const innerX = rect.outerX + leftFramePx;
    const innerY = rect.outerY + topFramePx;
    const innerW = Math.max(0, rect.outerW - leftFramePx - rightFramePx);
    const innerH = Math.max(0, rect.outerH - topFramePx - baseHeightPx);

    return {
        rect,
        scaleX,
        scaleY,
        leftFramePx,
        rightFramePx,
        topFramePx,
        baseHeightPx,
        innerX,
        innerY,
        innerW,
        innerH,
    };
}

export function getScaledSlotRects(room, editorData) {
    const { innerX, innerY, innerW, innerH } = getScaledLayout(room, editorData);
    const slots = getColumnSlots(room, editorData);

    return slots.map((slot, index) => {
        const x = innerX + (innerW / editorData.columnCount) * index;
        const width = innerW / editorData.columnCount;

        return {
            ...slot,
            x,
            y: innerY,
            width,
            height: innerH,
        };
    });
}