import { useEffect, useMemo, useRef, useState } from "react";
import {
    Circle,
    Group,
    Image as KonvaImage,
    Layer,
    Line,
    Rect,
    Stage,
    Text,
} from "react-konva";

function useHtmlImage(src) {
    const [image, setImage] = useState(null);

    useEffect(() => {
        if (!src) {
            setImage(null);
            return;
        }

        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = src;
        img.onload = () => setImage(img);

        return () => {
            img.onload = null;
        };
    }, [src]);

    return image;
}

function getDistance(start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export default function EditorCanvas({
    drawingImageUrl,
    drawingOpacity,
    drawingLocked,
    workspaceView,
    cameraView,
    isScaleMode,
    scalePoints,
    onPickScalePoint,
    isDrawMode,
    draftWallStart,
    onPickWallPoint,
    walls = [],
    mmPerPixel,
}) {
    const image = useHtmlImage(drawingImageUrl);
    const stageRef = useRef(null);
    const stageWrapRef = useRef(null);

    const [stageSize, setStageSize] = useState({ width: 960, height: 640 });
    const [stageScale, setStageScale] = useState(1);
    const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
    const [pointerCanvasPoint, setPointerCanvasPoint] = useState(null);
    const [snapPoint, setSnapPoint] = useState(null);

    useEffect(() => {
        function updateStageSize() {
            const canvasRoot = stageWrapRef.current;
            if (!canvasRoot) return;

            const nextWidth = Math.max(320, Math.floor(canvasRoot.clientWidth));
            const nextHeight = Math.max(320, Math.floor(canvasRoot.clientHeight));

            setStageSize((prev) => {
                if (prev.width === nextWidth && prev.height === nextHeight) {
                    return prev;
                }
                return { width: nextWidth, height: nextHeight };
            });
        }

        updateStageSize();
        window.addEventListener("resize", updateStageSize);
        return () => window.removeEventListener("resize", updateStageSize);
    }, []);

    const fittedImage = useMemo(() => {
        if (!image) return null;

        const maxWidth = stageSize.width - 80;
        const maxHeight = stageSize.height - 80;
        const fitScale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);

        const width = image.width * fitScale;
        const height = image.height * fitScale;

        return {
            x: (stageSize.width - width) / 2,
            y: (stageSize.height - height) / 2,
            width,
            height,
        };
    }, [image, stageSize]);

    useEffect(() => {
        if (!image || !fittedImage) return;
        setStageScale(1);
        setStagePosition({ x: 0, y: 0 });
    }, [image, fittedImage]);

    function getScenePoint() {
        const stage = stageRef.current;
        if (!stage) return null;

        const pointer = stage.getPointerPosition();
        if (!pointer) return null;

        const transform = stage.getAbsoluteTransform().copy();
        transform.invert();

        return transform.point(pointer);
    }

    function getSnapCandidate(point) {
        if (!point) return null;

        const candidates = [
            ...scalePoints,
            ...walls.flatMap((wall) => [wall.start, wall.end]),
            ...(draftWallStart ? [draftWallStart] : []),
        ];

        if (!candidates.length) return null;

        const snapDistanceScreenPx = 14;
        const snapDistanceWorld = snapDistanceScreenPx / stageScale;

        let nearest = null;
        let nearestDistance = Infinity;

        for (const candidate of candidates) {
            const distance = getDistance(point, candidate);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearest = candidate;
            }
        }

        if (nearestDistance <= snapDistanceWorld) {
            return nearest;
        }

        return null;
    }

    function getActivePoint() {
        const rawPoint = getScenePoint();
        if (!rawPoint) return null;

        if (!isScaleMode && !isDrawMode) {
            return rawPoint;
        }

        const snapped = getSnapCandidate(rawPoint);
        return snapped || rawPoint;
    }

    function handleWheel(event) {
        event.evt.preventDefault();

        const stage = stageRef.current;
        if (!stage) return;

        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const oldScale = stageScale;
        const scaleBy = 1.08;
        const direction = event.evt.deltaY > 0 ? -1 : 1;

        let nextScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
        nextScale = Math.max(0.2, Math.min(5, nextScale));

        const mousePointTo = {
            x: (pointer.x - stagePosition.x) / oldScale,
            y: (pointer.y - stagePosition.y) / oldScale,
        };

        const nextPosition = {
            x: pointer.x - mousePointTo.x * nextScale,
            y: pointer.y - mousePointTo.y * nextScale,
        };

        setStageScale(nextScale);
        setStagePosition(nextPosition);
    }

    function handleResetView() {
        setStageScale(1);
        setStagePosition({ x: 0, y: 0 });
    }

    function handleSetActualSize() {
        setStageScale(1);
    }

    function handleStageClick(event) {
        const clickedOnStage = event.target === stageRef.current;
        const clickedBackgroundImage =
            event.target?.attrs?.name === "drawing-background-image";
        const clickedCanvasBackground =
            event.target?.attrs?.name === "canvas-background";

        const canPickPoint =
            clickedOnStage || clickedBackgroundImage || clickedCanvasBackground;

        if (!canPickPoint) return;

        const scenePoint = getActivePoint();
        if (!scenePoint) return;

        if (isScaleMode && drawingImageUrl) {
            onPickScalePoint(scenePoint);
            return;
        }

        if (isDrawMode && drawingImageUrl) {
            onPickWallPoint(scenePoint);
        }
    }

    function handleStageMouseMove() {
        const rawPoint = getScenePoint();
        if (!rawPoint) {
            setPointerCanvasPoint(null);
            setSnapPoint(null);
            return;
        }

        if (!isScaleMode && !isDrawMode) {
            setPointerCanvasPoint(rawPoint);
            setSnapPoint(null);
            return;
        }

        const snapped = getSnapCandidate(rawPoint);
        setSnapPoint(snapped);
        setPointerCanvasPoint(snapped || rawPoint);
    }

    function handleDragEnd(event) {
        setStagePosition({
            x: event.target.x(),
            y: event.target.y(),
        });
    }

    const scaleLinePoints =
        scalePoints.length === 2
            ? [scalePoints[0].x, scalePoints[0].y, scalePoints[1].x, scalePoints[1].y]
            : [];

    const draftWallLinePoints =
        draftWallStart && pointerCanvasPoint
            ? [draftWallStart.x, draftWallStart.y, pointerCanvasPoint.x, pointerCanvasPoint.y]
            : [];

    const draftWallLengthLabel =
        draftWallStart && pointerCanvasPoint
            ? (() => {
                const px = getDistance(draftWallStart, pointerCanvasPoint);
                if (mmPerPixel) return `${(px * mmPerPixel).toFixed(0)} mm`;
                return `${px.toFixed(1)} px`;
            })()
            : "";

    const draftWallLabelPosition =
        draftWallStart && pointerCanvasPoint
            ? {
                x: (draftWallStart.x + pointerCanvasPoint.x) / 2 + 8,
                y: (draftWallStart.y + pointerCanvasPoint.y) / 2 - 18,
            }
            : null;

    const stageCursor = isScaleMode || isDrawMode
        ? "crosshair"
        : !drawingLocked
            ? "grab"
            : "default";

    return (
        <section className="editor-canvas-panel">
            <div className="editor-canvas-topbar">
                <div className="editor-canvas-status">
                    <span>{workspaceView}</span>
                    <span>·</span>
                    <span>{cameraView}</span>
                    <span>·</span>
                    <span>{drawingImageUrl ? "도면 로드됨" : "도면 없음"}</span>
                    <span>·</span>
                    <span>
                        {isScaleMode
                            ? "기준점 찍기 모드"
                            : isDrawMode
                                ? "벽선 그리기 모드"
                                : "일반 모드"}
                    </span>
                </div>

                <div className="editor-canvas-controls">
                    <span className="editor-canvas-zoom-label">
                        {Math.round(stageScale * 100)}%
                    </span>

                    <button
                        type="button"
                        className="editor-canvas-btn"
                        onClick={handleSetActualSize}
                    >
                        100%
                    </button>

                    <button
                        type="button"
                        className="editor-canvas-btn"
                        onClick={handleResetView}
                    >
                        위치 초기화
                    </button>
                </div>
            </div>

            <div
                ref={stageWrapRef}
                className="editor-canvas-stage-wrap"
                style={{ cursor: stageCursor }}
            >
                <Stage
                    ref={stageRef}
                    width={stageSize.width}
                    height={stageSize.height}
                    draggable={!drawingLocked && !isScaleMode && !isDrawMode}
                    x={stagePosition.x}
                    y={stagePosition.y}
                    scaleX={stageScale}
                    scaleY={stageScale}
                    dragDistance={6}
                    onWheel={handleWheel}
                    onClick={handleStageClick}
                    onTap={handleStageClick}
                    onMouseMove={handleStageMouseMove}
                    onDragEnd={handleDragEnd}
                >
                    <Layer listening>
                        <Group>
                            <Rect
                                x={0}
                                y={0}
                                width={stageSize.width}
                                height={stageSize.height}
                                fill="#f7f8fc"
                                name="canvas-background"
                                listening
                            />

                            {!drawingImageUrl && (
                                <>
                                    <Text
                                        x={stageSize.width / 2 - 110}
                                        y={stageSize.height / 2 - 18}
                                        text="도면을 업로드하면 여기에 표시됩니다"
                                        fontSize={18}
                                        fill="#667085"
                                        listening={false}
                                    />
                                    <Text
                                        x={stageSize.width / 2 - 82}
                                        y={stageSize.height / 2 + 14}
                                        text="기준선 설정 → 벽선 그리기 → 3D 변환"
                                        fontSize={14}
                                        fill="#98a2b3"
                                        listening={false}
                                    />
                                </>
                            )}

                            {image && fittedImage && (
                                <KonvaImage
                                    image={image}
                                    x={fittedImage.x}
                                    y={fittedImage.y}
                                    width={fittedImage.width}
                                    height={fittedImage.height}
                                    opacity={drawingOpacity}
                                    name="drawing-background-image"
                                    listening
                                />
                            )}

                            {scalePoints.map((point, index) => (
                                <Group key={`${point.x}-${point.y}-${index}`} listening={false}>
                                    <Circle
                                        x={point.x}
                                        y={point.y}
                                        radius={8}
                                        fill="#3867f4"
                                        stroke="#ffffff"
                                        strokeWidth={2}
                                    />
                                    <Text
                                        x={point.x + 10}
                                        y={point.y - 18}
                                        text={`P${index + 1}`}
                                        fontSize={13}
                                        fontStyle="bold"
                                        fill="#3867f4"
                                    />
                                </Group>
                            ))}

                            {scaleLinePoints.length === 4 && (
                                <Line
                                    points={scaleLinePoints}
                                    stroke="#3867f4"
                                    strokeWidth={2}
                                    dash={[8, 6]}
                                    listening={false}
                                />
                            )}

                            {walls.map((wall) => {
                                const midX = (wall.start.x + wall.end.x) / 2;
                                const midY = (wall.start.y + wall.end.y) / 2;
                                const lengthLabel = wall.lengthMm
                                    ? `${wall.lengthMm.toFixed(0)} mm`
                                    : `${wall.lengthPx.toFixed(1)} px`;

                                return (
                                    <Group key={wall.id} listening={false}>
                                        <Line
                                            points={[
                                                wall.start.x,
                                                wall.start.y,
                                                wall.end.x,
                                                wall.end.y,
                                            ]}
                                            stroke="#ef4444"
                                            strokeWidth={4}
                                            lineCap="round"
                                        />
                                        <Circle
                                            x={wall.start.x}
                                            y={wall.start.y}
                                            radius={5}
                                            fill="#ef4444"
                                        />
                                        <Circle
                                            x={wall.end.x}
                                            y={wall.end.y}
                                            radius={5}
                                            fill="#ef4444"
                                        />
                                        <Text
                                            x={midX + 8}
                                            y={midY - 18}
                                            text={lengthLabel}
                                            fontSize={12}
                                            fontStyle="bold"
                                            fill="#b42318"
                                        />
                                    </Group>
                                );
                            })}

                            {draftWallLinePoints.length === 4 && (
                                <>
                                    <Line
                                        points={draftWallLinePoints}
                                        stroke="#f97316"
                                        strokeWidth={3}
                                        dash={[6, 6]}
                                        listening={false}
                                    />
                                    {draftWallLabelPosition && (
                                        <Text
                                            x={draftWallLabelPosition.x}
                                            y={draftWallLabelPosition.y}
                                            text={draftWallLengthLabel}
                                            fontSize={12}
                                            fontStyle="bold"
                                            fill="#ea580c"
                                            listening={false}
                                        />
                                    )}
                                </>
                            )}

                            {snapPoint && (isScaleMode || isDrawMode) && (
                                <Circle
                                    x={snapPoint.x}
                                    y={snapPoint.y}
                                    radius={9}
                                    stroke="#2563eb"
                                    strokeWidth={2}
                                    dash={[4, 4]}
                                    fill="rgba(37,99,235,0.08)"
                                    listening={false}
                                />
                            )}
                        </Group>
                    </Layer>
                </Stage>
            </div>
        </section>
    );
}