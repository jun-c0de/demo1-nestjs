<<<<<<< HEAD
<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProject } from "../../api/project";
import { getDesign, updateDesign } from "../../api/design";
import { useAuth } from "../../contexts/AuthContext";
import { useProjectEditorStore } from "../stores/projectEditorStore";
import ProjectEditorSidebar from "./ProjectEditorSidebar";
import ProjectEditorCanvas from "./ProjectEditorCanvas";
import ProjectEditorInspector from "./ProjectEditorInspector";

function folderStorageKey(projectId) {
    return `craft:folders:${projectId}`;
}

function designLocationStorageKey(projectId) {
    return `craft:design-locations:${projectId}`;
}

function readJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function buildFolderPath(folders, folderId) {
    if (!folderId) return [];

    const byId = new Map(folders.map((folder) => [folder.id, folder]));
    const path = [];
    let current = byId.get(folderId);

    while (current) {
        path.unshift(current);
        current = current.parentId ? byId.get(current.parentId) : null;
    }

    return path;
}
=======
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
=======
import { useState } from "react";
>>>>>>> parent of c5167a3 (canvas1)
import AppShell from "../../components/layout/AppShell";
import EditorHeader from "../../components/editor/EditorHeader.jsx";
import EditorLeftPanel from "../../components/editor/EditorLeftPanel.jsx/index.js";
import EditorCanvas from "../../components/editor/EditorCanvas";
import EditorRightPanel from "../../components/editor/EditorRightPanel.jsx/index.js";
import "../../styles/editor.css";
>>>>>>> parent of d4bdec2 (Revert "canvas1")

export default function ProjectEditorPage() {
<<<<<<< HEAD
    const navigate = useNavigate();
    const { projectId, designId } = useParams();
<<<<<<< HEAD
    const { user, authLoading, logoutUser } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    const project = useProjectEditorStore((state) => state.project);
    const design = useProjectEditorStore((state) => state.design);
    const room = useProjectEditorStore((state) => state.room);
    const editorData = useProjectEditorStore((state) => state.editorData);
    const setProject = useProjectEditorStore((state) => state.setProject);
    const setDesign = useProjectEditorStore((state) => state.setDesign);

    const [folders, setFolders] = useState([]);
    const [designLocations, setDesignLocations] = useState({});

    useEffect(() => {
        if (authLoading || !user) return;

        async function initializePage() {
            try {
                const [projectData, designData] = await Promise.all([
                    getProject(projectId),
                    getDesign(projectId, designId),
                ]);

                setProject(projectData?.project || projectData);
                setDesign(designData?.design || designData);
                setFolders(readJson(folderStorageKey(projectId), []));
                setDesignLocations(readJson(designLocationStorageKey(projectId), {}));
            } catch (error) {
                console.error(error);
                navigate("/dashboard", { replace: true });
            } finally {
                setIsLoading(false);
            }
        }

        initializePage();
    }, [authLoading, user, navigate, projectId, designId, setProject, setDesign]);

    const breadcrumbItems = useMemo(() => {
        const folderPath = buildFolderPath(folders, designLocations[designId]);

        return [
            "내 프로젝트",
            project?.title,
            ...folderPath.map((folder) => folder.name),
            design?.name,
        ].filter(Boolean);
    }, [folders, designLocations, designId, project, design]);

    async function handleSave() {
        try {
            await updateDesign(projectId, designId, {
                name: design?.name,
                room,
                editorData,
            });
            alert("저장되었습니다.");
        } catch (error) {
            alert(error.message);
        }
    }

    function handleExit() {
        navigate(`/projects/${projectId}`);
    }

    if (authLoading || isLoading || !project || !design) {
        return <div className="page-state">디자인 불러오는 중...</div>;
    }

    return (
        <div className="project-editor-page">
            <header className="project-editor-topbar">
                <div className="project-editor-topbar__left">
                    <button type="button" onClick={() => navigate("/dashboard")}>CRAFT</button>
                    <div className="project-editor-breadcrumbs">
                        {breadcrumbItems.join(" > ")}
                    </div>
=======
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
=======
    const [mode, setMode] = useState("module"); // module | drawing
    const [view, setView] = useState("2D");
>>>>>>> parent of c5167a3 (canvas1)

    return (
        <AppShell>
            <div className="editor-page">
                <EditorHeader view={view} onChangeView={setView} />

                <div className="editor-workspace">
                    <EditorLeftPanel mode={mode} onChangeMode={setMode} />

                    <EditorCanvas view={view} />

<<<<<<< HEAD
                    <EditorRightPanel
                        drawingFile={drawingFile}
                        drawingLocked={drawingLocked}
                        drawingOpacity={drawingOpacity}
                        workspaceView={workspaceView}
                        cameraView={cameraView}
                    />
>>>>>>> parent of d4bdec2 (Revert "canvas1")
=======
                    <EditorRightPanel />
>>>>>>> parent of c5167a3 (canvas1)
                </div>

                <div className="project-editor-topbar__right">
                    <button type="button" onClick={handleSave}>저장</button>
                    <button type="button" onClick={handleExit}>저장하고 나가기</button>
                    <button type="button" onClick={logoutUser}>로그아웃</button>
                </div>
            </header>

            <div className="project-editor-explorer-bar">
                {breadcrumbItems.join(" > ")}
            </div>

            <div className="project-editor-layout">
                <ProjectEditorSidebar />
                <ProjectEditorCanvas />
                <ProjectEditorInspector />
            </div>
        </div>
    );
}