import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getProject } from "../../api/projects";
import { getDesignsByProject } from "../../api/designs";
import EditorHeader from "../../components/editor/EditorHeader";
import EditorLeftPanel from "../../components/editor/EditorLeftPanel";
import EditorCanvas from "../../components/editor/EditorCanvas";
import EditorThreeCanvas from "../../components/editor/EditorThreeCanvas";
import EditorRightPanel from "../../components/editor/EditorRightPanel";
import "../../styles/editor.css";

export default function ProjectEditorPage() {
    const navigate = useNavigate();
    const { projectId, designId } = useParams();
    const { user } = useAuth();

    const [leftTab, setLeftTab] = useState("drawing");
    const [workspaceView, setWorkspaceView] = useState("2D");
    const [cameraView, setCameraView] = useState("입면");

    const [projectTitle, setProjectTitle] = useState("프로젝트");
    const [designTitle, setDesignTitle] = useState("디자인");
    const [isLoadingNames, setIsLoadingNames] = useState(true);

    const [drawingFile, setDrawingFile] = useState(null);
    const [drawingImageUrl, setDrawingImageUrl] = useState("");
    const [drawingOpacity, setDrawingOpacity] = useState(0.9);
    const [drawingLocked, setDrawingLocked] = useState(false);

    const [isScaleMode, setIsScaleMode] = useState(false);
    const [scalePoints, setScalePoints] = useState([]);
    const [pixelDistance, setPixelDistance] = useState(0);
    const [realDistanceMm, setRealDistanceMm] = useState("");
    const [mmPerPixel, setMmPerPixel] = useState(null);

    const [isDrawMode, setIsDrawMode] = useState(false);
    const [draftWallStart, setDraftWallStart] = useState(null);
    const [walls, setWalls] = useState([]);

    useEffect(() => {
        let isMounted = true;

        async function loadEditorInfo() {
            try {
                setIsLoadingNames(true);

                const [projectData, designData] = await Promise.all([
                    getProject(projectId),
                    getDesignsByProject(projectId),
                ]);

                const resolvedProject = projectData?.project || projectData;
                const resolvedDesigns = Array.isArray(designData)
                    ? designData
                    : designData?.designs || [];

                const matchedDesign = resolvedDesigns.find(
                    (item) => (item.id || item._id) === designId
                );

                if (!isMounted) return;

                setProjectTitle(resolvedProject?.title || "프로젝트");
                setDesignTitle(matchedDesign?.name || matchedDesign?.title || "디자인");
            } catch (error) {
                console.error("에디터 정보 로딩 실패:", error);
                if (!isMounted) return;
                setProjectTitle("프로젝트");
                setDesignTitle("디자인");
            } finally {
                if (isMounted) {
                    setIsLoadingNames(false);
                }
            }
        }

        if (projectId) {
            loadEditorInfo();
        }

        return () => {
            isMounted = false;
            if (drawingImageUrl) {
                URL.revokeObjectURL(drawingImageUrl);
            }
        };
    }, [projectId, designId, drawingImageUrl]);

    const breadcrumbItems = useMemo(
        () => [
            { key: "dashboard", label: "내 프로젝트" },
            { key: "project", label: isLoadingNames ? "불러오는 중..." : projectTitle },
            { key: "design", label: isLoadingNames ? "불러오는 중..." : designTitle },
        ],
        [projectTitle, designTitle, isLoadingNames]
    );

    const enrichedWalls = useMemo(() => {
        return walls.map((wall, index) => {
            const dx = wall.end.x - wall.start.x;
            const dy = wall.end.y - wall.start.y;
            const lengthPx = Math.sqrt(dx * dx + dy * dy);
            const lengthMm = mmPerPixel ? lengthPx * mmPerPixel : null;

            return {
                ...wall,
                index: index + 1,
                lengthPx,
                lengthMm,
            };
        });
    }, [walls, mmPerPixel]);

    const totalWallLengthMm = useMemo(() => {
        return enrichedWalls.reduce((sum, wall) => sum + (wall.lengthMm || 0), 0);
    }, [enrichedWalls]);

    function handleUploadDrawing(file) {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("현재는 JPG, PNG 같은 이미지 파일만 업로드할 수 있습니다.");
            return;
        }

        const nextUrl = URL.createObjectURL(file);

        setDrawingFile(file);
        setDrawingImageUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return nextUrl;
        });
        setLeftTab("drawing");
        setScalePoints([]);
        setPixelDistance(0);
        setRealDistanceMm("");
        setMmPerPixel(null);
        setDraftWallStart(null);
        setWalls([]);
        setIsScaleMode(false);
        setIsDrawMode(false);
    }

    function handleClearDrawing() {
        setDrawingFile(null);
        setDrawingImageUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return "";
        });
        setScalePoints([]);
        setPixelDistance(0);
        setRealDistanceMm("");
        setMmPerPixel(null);
        setDraftWallStart(null);
        setWalls([]);
        setIsScaleMode(false);
        setIsDrawMode(false);
    }

    function handleCanvasPickScalePoint(point) {
        if (!isScaleMode) return;

        setScalePoints((prev) => {
            if (prev.length === 0) {
                return [point];
            }

            if (prev.length === 1) {
                const next = [prev[0], point];
                const dx = next[1].x - next[0].x;
                const dy = next[1].y - next[0].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                setPixelDistance(distance);
                return next;
            }

            setPixelDistance(0);
            return [point];
        });
    }

    function handleApplyScale() {
        const mmValue = Number(realDistanceMm);

        if (scalePoints.length !== 2) {
            alert("먼저 기준점 2개를 찍어주세요.");
            return;
        }

        if (!pixelDistance || pixelDistance <= 0) {
            alert("유효한 픽셀 길이를 찾을 수 없습니다.");
            return;
        }

        if (!mmValue || mmValue <= 0) {
            alert("실제 길이(mm)를 입력해주세요.");
            return;
        }

        setMmPerPixel(mmValue / pixelDistance);
        setIsScaleMode(false);
    }

    function handleResetScalePoints() {
        setScalePoints([]);
        setPixelDistance(0);
    }

    function handleToggleScaleMode() {
        setIsScaleMode((prev) => {
            const next = !prev;
            if (next) {
                setIsDrawMode(false);
                setDraftWallStart(null);
            }
            return next;
        });
    }

    function handleToggleDrawMode() {
        if (!mmPerPixel) {
            alert("먼저 기준 길이를 설정해주세요.");
            return;
        }

        setIsDrawMode((prev) => {
            const next = !prev;
            if (next) {
                setIsScaleMode(false);
            } else {
                setDraftWallStart(null);
            }
            return next;
        });
    }

    function handleCanvasPickWallPoint(point) {
        if (!isDrawMode) return;

        if (!draftWallStart) {
            setDraftWallStart(point);
            return;
        }

        const nextWall = {
            id: `wall-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            start: draftWallStart,
            end: point,
        };

        setWalls((prev) => [...prev, nextWall]);
        setDraftWallStart(point);
    }

    function handleFinishWallDrawing() {
        setDraftWallStart(null);
    }

    function handleRemoveWall(wallId) {
        setWalls((prev) => prev.filter((wall) => wall.id !== wallId));
    }

    function handleClearWalls() {
        setWalls([]);
        setDraftWallStart(null);
    }

    return (
        <div className="editor-shell">
            <div className="editor-shell-topbar">
                <button
                    type="button"
                    className="editor-shell-brand"
                    onClick={() => navigate("/dashboard")}
                >
                    CRAFT
                </button>

                <div className="editor-shell-userbox">
                    <button
                        type="button"
                        className="editor-shell-create-btn"
                        onClick={() => navigate(`/projects/${projectId}`)}
                    >
                        프로젝트로
                    </button>
                    <div className="editor-shell-avatar">
                        {user?.name?.[0] || "U"}
                    </div>
                </div>
            </div>

            <div className="editor-shell-body">
                <EditorHeader
                    breadcrumbs={breadcrumbItems}
                    workspaceView={workspaceView}
                    onChangeWorkspaceView={setWorkspaceView}
                    cameraView={cameraView}
                    onChangeCameraView={setCameraView}
                    onGoDashboard={() => navigate("/dashboard")}
                    onSave={() => alert("저장 기능은 다음 단계에서 연결합니다.")}
                    onExit={() => navigate(`/projects/${projectId}`)}
                />

                <div className="editor-workspace">
                    <EditorLeftPanel
                        activeTab={leftTab}
                        onChangeTab={setLeftTab}
                        drawingFile={drawingFile}
                        drawingImageUrl={drawingImageUrl}
                        drawingLocked={drawingLocked}
                        drawingOpacity={drawingOpacity}
                        onUploadDrawing={handleUploadDrawing}
                        onClearDrawing={handleClearDrawing}
                        onToggleLocked={() => setDrawingLocked((prev) => !prev)}
                        onChangeOpacity={setDrawingOpacity}
                        isScaleMode={isScaleMode}
                        onToggleScaleMode={handleToggleScaleMode}
                        scalePoints={scalePoints}
                        pixelDistance={pixelDistance}
                        realDistanceMm={realDistanceMm}
                        onChangeRealDistanceMm={setRealDistanceMm}
                        onApplyScale={handleApplyScale}
                        onResetScalePoints={handleResetScalePoints}
                        mmPerPixel={mmPerPixel}
                        isDrawMode={isDrawMode}
                        onToggleDrawMode={handleToggleDrawMode}
                        onFinishWallDrawing={handleFinishWallDrawing}
                        draftWallStart={draftWallStart}
                        wallCount={enrichedWalls.length}
                        onClearWalls={handleClearWalls}
                    />

                    {workspaceView === "2D" ? (
                        <EditorCanvas
                            drawingImageUrl={drawingImageUrl}
                            drawingOpacity={drawingOpacity}
                            drawingLocked={drawingLocked}
                            workspaceView={workspaceView}
                            cameraView={cameraView}
                            isScaleMode={isScaleMode}
                            scalePoints={scalePoints}
                            onPickScalePoint={handleCanvasPickScalePoint}
                            isDrawMode={isDrawMode}
                            draftWallStart={draftWallStart}
                            onPickWallPoint={handleCanvasPickWallPoint}
                            walls={enrichedWalls}
                            mmPerPixel={mmPerPixel}
                        />
                    ) : (
                        <EditorThreeCanvas
                            walls={enrichedWalls}
                            mmPerPixel={mmPerPixel}
                            wallHeightMm={2400}
                            wallThicknessMm={120}
                        />
                    )}

                    <EditorRightPanel
                        drawingFile={drawingFile}
                        drawingLocked={drawingLocked}
                        drawingOpacity={drawingOpacity}
                        workspaceView={workspaceView}
                        cameraView={cameraView}
                        mmPerPixel={mmPerPixel}
                        pixelDistance={pixelDistance}
                        realDistanceMm={realDistanceMm}
                        walls={enrichedWalls}
                        totalWallLengthMm={totalWallLengthMm}
                        onRemoveWall={handleRemoveWall}
                        onClearWalls={handleClearWalls}
                    />
                </div>
            </div>
        </div>
    );
}