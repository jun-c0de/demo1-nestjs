import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppShell from "../../components/layout/AppShell";
import { useAuth } from "../../contexts/AuthContext";
import EditorHeader from "../../components/editor/EditorHeader";
import EditorLeftPanel from "../../components/editor/EditorLeftPanel";
import EditorCanvas from "../../components/editor/EditorCanvas";
import EditorRightPanel from "../../components/editor/EditorRightPanel";
import "../../styles/editor.css";

export default function ProjectEditorPage() {
    const navigate = useNavigate();
    const { projectId, designId } = useParams();
    const { user, logoutUser } = useAuth();

    const [leftTab, setLeftTab] = useState("drawing");
    const [workspaceView, setWorkspaceView] = useState("2D");
    const [cameraView, setCameraView] = useState("입면");

    const [drawingFile, setDrawingFile] = useState(null);
    const [drawingImageUrl, setDrawingImageUrl] = useState("");
    const [drawingOpacity, setDrawingOpacity] = useState(0.9);
    const [drawingLocked, setDrawingLocked] = useState(false);

    const breadcrumbItems = useMemo(
        () => [
            { key: "dashboard", label: "내 프로젝트" },
            { key: "project", label: projectId || "프로젝트" },
            { key: "design", label: designId || "디자인" },
        ],
        [projectId, designId]
    );

    function handleUploadDrawing(file) {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("현재는 JPG, PNG 같은 이미지 파일만 업로드할 수 있습니다.");
            return;
        }

        const nextUrl = URL.createObjectURL(file);
        setDrawingFile(file);
        setDrawingImageUrl((prev) => {
            if (prev) {
                URL.revokeObjectURL(prev);
            }
            return nextUrl;
        });
        setLeftTab("drawing");
    }

    function handleClearDrawing() {
        setDrawingFile(null);
        setDrawingImageUrl((prev) => {
            if (prev) {
                URL.revokeObjectURL(prev);
            }
            return "";
        });
    }

    return (
        <AppShell
            user={user}
            activeMenu="active"
            counts={{}}
            onChangeMenu={() => { }}
            onCreateClick={() => { }}
            onLogout={logoutUser}
            onGoDashboard={() => navigate("/dashboard")}
        >
            <div className="editor-page">
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
                    />

                    <EditorCanvas
                        drawingImageUrl={drawingImageUrl}
                        drawingOpacity={drawingOpacity}
                        drawingLocked={drawingLocked}
                        workspaceView={workspaceView}
                        cameraView={cameraView}
                    />

                    <EditorRightPanel
                        drawingFile={drawingFile}
                        drawingLocked={drawingLocked}
                        drawingOpacity={drawingOpacity}
                        workspaceView={workspaceView}
                        cameraView={cameraView}
                    />
                </div>
            </div>
        </AppShell>
    );
}