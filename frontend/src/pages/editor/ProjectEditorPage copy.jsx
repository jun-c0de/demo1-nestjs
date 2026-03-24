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

export default function ProjectEditorPage() {
    const navigate = useNavigate();
    const { projectId, designId } = useParams();
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