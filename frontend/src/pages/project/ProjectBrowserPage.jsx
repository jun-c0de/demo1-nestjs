import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProject } from "../../api/projects";
import { createDesign, getDesignsByProject } from "../../api/designs";
import { useAuth } from "../../contexts/AuthContext";
import AppShell from "../../components/layout/AppShell";
import CreateDesignModal from "./CreateDesignModal";
import ProjectBrowserGrid from "./ProjectBrowserGrid";
import ProjectBrowserToolbar from "./ProjectBrowserToolbar";

const ROOT_FOLDER_ID = null;

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

function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function sortItems(items, sortMode) {
    const copied = [...items];

    if (sortMode === "이름순") {
        return copied.sort((a, b) =>
            (a.name || a.title || "").localeCompare(b.name || b.title || "", "ko")
        );
    }

    return copied.sort((a, b) => {
        const left = new Date(b.updatedAt || b.createdAt || 0).getTime();
        const right = new Date(a.updatedAt || a.createdAt || 0).getTime();
        return left - right;
    });
}

function getFolderPath(folders, folderId) {
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

export default function ProjectBrowserPage() {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const { user, authLoading, logoutUser } = useAuth();

    const [project, setProject] = useState(null);
    const [designs, setDesigns] = useState([]);
    const [folders, setFolders] = useState([]);
    const [designLocations, setDesignLocations] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateDesignModalOpen, setIsCreateDesignModalOpen] = useState(false);
    const [designName, setDesignName] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [viewMode, setViewMode] = useState("보통 아이콘");
    const [sortMode, setSortMode] = useState("수정일순");
    const [currentFolderId, setCurrentFolderId] = useState(ROOT_FOLDER_ID);

    const [backHistory, setBackHistory] = useState([]);
    const [forwardHistory, setForwardHistory] = useState([]);

    useEffect(() => {
        if (authLoading || !user) return;

        async function initializePage() {
            try {
                const [projectData, designData] = await Promise.all([
                    getProject(projectId),
                    getDesignsByProject(projectId),
                ]);

                setProject(projectData?.project || projectData);
                setDesigns(Array.isArray(designData) ? designData : designData?.designs || []);
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
    }, [authLoading, user, navigate, projectId]);

    useEffect(() => {
        writeJson(folderStorageKey(projectId), folders);
    }, [projectId, folders]);

    useEffect(() => {
        writeJson(designLocationStorageKey(projectId), designLocations);
    }, [projectId, designLocations]);

    const currentFolderPath = useMemo(
        () => getFolderPath(folders, currentFolderId),
        [folders, currentFolderId]
    );

    const breadcrumbs = useMemo(
        () => [
            { key: "dashboard", label: "내 프로젝트" },
            { key: "project-root", label: project?.title || "프로젝트" },
            ...currentFolderPath.map((folder) => ({ key: folder.id, label: folder.name })),
        ],
        [project, currentFolderPath]
    );

    const visibleFolders = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();

        return sortItems(
            folders
                .filter((folder) => folder.parentId === currentFolderId)
                .filter((folder) => !keyword || folder.name.toLowerCase().includes(keyword)),
            sortMode
        ).map((folder) => ({
            ...folder,
            type: "folder",
            childrenCount:
                folders.filter((item) => item.parentId === folder.id).length +
                designs.filter(
                    (design) =>
                        (designLocations[design.id || design._id] || ROOT_FOLDER_ID) === folder.id
                ).length,
        }));
    }, [folders, designs, designLocations, currentFolderId, searchKeyword, sortMode]);

    const visibleDesigns = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();

        return sortItems(
            designs
                .filter(
                    (design) =>
                        (designLocations[design.id || design._id] || ROOT_FOLDER_ID) ===
                        currentFolderId
                )
                .filter((design) => !keyword || (design.name || "").toLowerCase().includes(keyword)),
            sortMode
        );
    }, [designs, designLocations, currentFolderId, searchKeyword, sortMode]);

    async function handleCreateDesign() {
        const trimmedName = designName.trim();

        if (!trimmedName) {
            alert("디자인 이름을 입력해주세요.");
            return;
        }

        try {
            const data = await createDesign(projectId, { name: trimmedName });
            const createdDesign = data?.design || data;
            const createdId = createdDesign?.id || createdDesign?._id;

            setDesigns((prev) => [createdDesign, ...prev]);

            if (createdId) {
                setDesignLocations((prev) => ({
                    ...prev,
                    [createdId]: currentFolderId,
                }));
            }

            setIsCreateDesignModalOpen(false);
            setDesignName("");

            if (createdId) {
                navigate(`/projects/${projectId}/designs/${createdId}`);
            }
        } catch (error) {
            alert(error.message || "디자인 생성 중 오류가 발생했습니다.");
        }
    }

    function handleCreateFolder() {
        const name = window.prompt("새 폴더 이름을 입력하세요.")?.trim();

        if (!name) return;

        const nextFolder = {
            id: `folder-${Date.now()}`,
            name,
            parentId: currentFolderId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            type: "folder",
        };

        setFolders((prev) => [nextFolder, ...prev]);
    }

    function moveToFolder(nextFolderId) {
        if (nextFolderId === currentFolderId) return;

        setBackHistory((prev) => [...prev, currentFolderId]);
        setForwardHistory([]);
        setCurrentFolderId(nextFolderId);
    }

    function handleOpenFolder(folder) {
        moveToFolder(folder.id);
    }

    function handleOpenDesign(design) {
        const designId = design.id || design._id;
        navigate(`/projects/${projectId}/designs/${designId}`);
    }

    function handleNavigateBreadcrumb(key) {
        if (key === "dashboard") {
            navigate("/dashboard");
            return;
        }

        const nextFolderId = key === "project-root" ? ROOT_FOLDER_ID : key;
        moveToFolder(nextFolderId);
    }

    function handleGoBack() {
        if (!backHistory.length) return;

        const previousFolderId = backHistory[backHistory.length - 1];

        setBackHistory((prev) => prev.slice(0, -1));
        setForwardHistory((prev) => [...prev, currentFolderId]);
        setCurrentFolderId(previousFolderId);
    }

    function handleGoForward() {
        if (!forwardHistory.length) return;

        const nextFolderId = forwardHistory[forwardHistory.length - 1];

        setForwardHistory((prev) => prev.slice(0, -1));
        setBackHistory((prev) => [...prev, currentFolderId]);
        setCurrentFolderId(nextFolderId);
    }

    function handleGoUp() {
        if (currentFolderId === ROOT_FOLDER_ID) return;

        const currentFolder = folders.find((folder) => folder.id === currentFolderId);
        const parentFolderId = currentFolder?.parentId ?? ROOT_FOLDER_ID;

        setBackHistory((prev) => [...prev, currentFolderId]);
        setForwardHistory([]);
        setCurrentFolderId(parentFolderId);
    }

    if (authLoading || isLoading || !project) {
        return <div className="page-state">프로젝트 불러오는 중...</div>;
    }

    return (
        <AppShell
            user={user}
            activeMenu="active"
            counts={{}}
            onChangeMenu={() => { }}
            onCreateClick={() => setIsCreateDesignModalOpen(true)}
            onLogout={logoutUser}
            onGoDashboard={() => navigate("/dashboard")}
        >
            <div className="project-browser-page">
                <ProjectBrowserToolbar
                    breadcrumbs={breadcrumbs}
                    searchKeyword={searchKeyword}
                    onChangeSearchKeyword={setSearchKeyword}
                    viewMode={viewMode}
                    onChangeViewMode={setViewMode}
                    sortMode={sortMode}
                    onChangeSortMode={setSortMode}
                    onCreateDesign={() => setIsCreateDesignModalOpen(true)}
                    onCreateFolder={handleCreateFolder}
                    onNavigateBreadcrumb={handleNavigateBreadcrumb}
                    onGoBack={handleGoBack}
                    onGoForward={handleGoForward}
                    onGoUp={handleGoUp}
                    canGoBack={backHistory.length > 0}
                    canGoForward={forwardHistory.length > 0}
                    canGoUp={currentFolderId !== ROOT_FOLDER_ID}
                />

                <div className="project-browser-content">
                    <ProjectBrowserGrid
                        folders={visibleFolders}
                        designs={visibleDesigns}
                        viewMode={viewMode}
                        onOpenFolder={handleOpenFolder}
                        onOpenDesign={handleOpenDesign}
                    />
                </div>
            </div>

            {isCreateDesignModalOpen && (
                <CreateDesignModal
                    value={designName}
                    onChange={setDesignName}
                    onClose={() => {
                        setIsCreateDesignModalOpen(false);
                        setDesignName("");
                    }}
                    onSubmit={handleCreateDesign}
                />
            )}
        </AppShell>
    );
}