import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
    createProject,
    deleteProjectForever,
    duplicateProject,
    getProjectCounts,
    getProjects,
    renameProject,
    updateProjectStatus,
} from "../../api/projects";
import { getSharedByMe, getSharedWithMe } from "../../api/shares";
import AppShell from "../../components/layout/AppShell";
import DashboardToolbar from "./DashboardToolbar";
import ProjectGrid from "./ProjectGrid";
import CreateProjectModal from "./CreateProjectModal";
import RenameProjectModal from "./RenameProjectModal";
import ShareProjectModal from "./ShareProjectModal";

function mapSortLabelToQuery(sortMode) {
    if (sortMode === "이름순") return "name_asc";
    if (sortMode === "종류순") return "fileCount_desc";
    return "updatedAt_desc";
}

function mapSidebarToStatus(sidebarMenu) {
    if (sidebarMenu === "completed") return "completed";
    if (sidebarMenu === "trash") return "trash";
    return "active";
}

export default function DashboardPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user, logoutUser, authLoading } = useAuth();

    const [projects, setProjects] = useState([]);
    const [counts, setCounts] = useState({
        active: 0,
        completed: 0,
        trash: 0,
        sharedWithMe: 0,
        sharedByMe: 0,
    });

    const [activeMenu, setActiveMenu] = useState(searchParams.get("menu") || "active");
    const [viewMode, setViewMode] = useState("보통 아이콘");
    const [sortMode, setSortMode] = useState("수정일순");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [projectTitle, setProjectTitle] = useState("");
    const [openMenuProjectId, setOpenMenuProjectId] = useState(null);
    const [renameTarget, setRenameTarget] = useState(null);
    const [renameValue, setRenameValue] = useState("");
    const [shareTarget, setShareTarget] = useState(null);

    useEffect(() => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("menu", activeMenu);
            return next;
        });
    }, [activeMenu, setSearchParams]);

    async function refreshCounts() {
        try {
            const data = await getProjectCounts();
            setCounts(
                data?.counts ||
                data || {
                    active: 0,
                    completed: 0,
                    trash: 0,
                    sharedWithMe: 0,
                    sharedByMe: 0,
                }
            );
        } catch (error) {
            console.error("Failed to fetch counts:", error);
        }
    }

    useEffect(() => {
        if (authLoading || !user) return;

        async function fetchItems() {
            try {
                setIsLoadingProjects(true);

                if (activeMenu === "sharedWithMe" || activeMenu === "sharedByMe") {
                    const fetchFn = activeMenu === "sharedWithMe" ? getSharedWithMe : getSharedByMe;
                    const data = await fetchFn({
                        search: searchKeyword,
                        sort: mapSortLabelToQuery(sortMode),
                    });

                    const items = Array.isArray(data) ? data : data?.items || [];
                    const mapped = items
                        .filter((item) => item.project)
                        .map((item) => ({
                            id: item.project.id || item.project._id,
                            title: item.project.title,
                            fileCount: item.project.fileCount ?? 0,
                            createdAt: item.project.createdAt,
                            updatedAt: item.project.updatedAt,
                            shareId: item.id || item._id,
                            shareType: activeMenu === "sharedWithMe" ? "withMe" : "byMe",
                            ownerName: item.owner?.name || item.sharedWith?.name || "",
                            ownerEmail: item.owner?.email || item.sharedWith?.email || "",
                        }));

                    setProjects(mapped);
                    return;
                }

                const data = await getProjects({
                    status: mapSidebarToStatus(activeMenu),
                    search: searchKeyword,
                    sort: mapSortLabelToQuery(sortMode),
                });

                setProjects(data?.projects || data || []);
                await refreshCounts();
            } catch (error) {
                console.error("Fetch Items Error:", error);
            } finally {
                setIsLoadingProjects(false);
            }
        }

        const timeout = setTimeout(fetchItems, 250);
        return () => clearTimeout(timeout);
    }, [user, authLoading, activeMenu, searchKeyword, sortMode]);

    useEffect(() => {
        if (!authLoading && user) {
            refreshCounts();
        }
    }, [authLoading, user]);

    async function handleCreateProject() {
        const trimmedTitle = projectTitle.trim();

        if (!trimmedTitle) {
            alert("이름을 입력해주세요.");
            return;
        }

        try {
            const data = await createProject({ title: trimmedTitle });
            const createdProject = data?.project || data;
            const createdProjectId = createdProject?.id || createdProject?._id;

            if (activeMenu === "active") {
                setProjects((prev) => [createdProject, ...prev]);
            }

            await refreshCounts();
            setIsCreateModalOpen(false);
            setProjectTitle("");

            if (createdProjectId) {
                navigate(`/projects/${createdProjectId}`);
            }
        } catch (error) {
            alert(error.message);
        }
    }

    async function handleMoveStatus(projectId, status) {
        try {
            await updateProjectStatus(projectId, { status });
            setProjects((prev) => prev.filter((project) => (project.id || project._id) !== projectId));
            setOpenMenuProjectId(null);
            await refreshCounts();
        } catch (error) {
            alert(error.message);
        }
    }

    async function handlePermanentDelete(projectId) {
        if (!window.confirm("영구 삭제하시겠습니까?")) return;

        try {
            await deleteProjectForever(projectId);
            setProjects((prev) => prev.filter((project) => (project.id || project._id) !== projectId));
            setOpenMenuProjectId(null);
            await refreshCounts();
        } catch (error) {
            alert(error.message);
        }
    }

    async function handleDuplicate(projectId) {
        try {
            const data = await duplicateProject(projectId);
            const duplicatedProject = data?.project || data;

            if (activeMenu === "active") {
                setProjects((prev) => [duplicatedProject, ...prev]);
            }

            await refreshCounts();
            setOpenMenuProjectId(null);
        } catch (error) {
            alert(error.message);
        }
    }

    async function handleRenameSubmit() {
        const trimmedTitle = renameValue.trim();

        if (!trimmedTitle || !renameTarget) return;

        try {
            const targetId = renameTarget.id || renameTarget._id;
            const data = await renameProject(targetId, { title: trimmedTitle });
            const updatedProject = data?.project || data;

            setProjects((prev) =>
                prev.map((project) =>
                    (project.id || project._id) === targetId ? updatedProject : project
                )
            );

            setRenameTarget(null);
            setRenameValue("");
        } catch (error) {
            alert(error.message);
        }
    }

    function handleOpenProject(project) {
        const targetId = project.id || project._id;
        navigate(`/projects/${targetId}`);
    }

    const currentSectionTitle = useMemo(() => {
        const titles = {
            active: "진행중 프로젝트",
            completed: "완료된 프로젝트",
            trash: "휴지통",
            sharedWithMe: "공유받은 파일",
            sharedByMe: "공유한 파일",
        };

        return titles[activeMenu] || "프로젝트";
    }, [activeMenu]);

    const dashboardBreadcrumbs = useMemo(
        () => [
            { key: "dashboard-root", label: "내 프로젝트" },
            { key: activeMenu, label: currentSectionTitle },
        ],
        [activeMenu, currentSectionTitle]
    );

    if (authLoading) {
        return <div className="page-state">인증 확인 중...</div>;
    }

    return (
        <AppShell
            user={user}
            activeMenu={activeMenu}
            counts={counts}
            onChangeMenu={setActiveMenu}
            onCreateClick={() => setIsCreateModalOpen(true)}
            onLogout={logoutUser}
            onGoDashboard={() => navigate("/dashboard")}
        >
            <div className="project-browser-page">
                <DashboardToolbar
                    breadcrumbs={dashboardBreadcrumbs}
                    searchKeyword={searchKeyword}
                    onChangeSearchKeyword={setSearchKeyword}
                    viewMode={viewMode}
                    onChangeViewMode={setViewMode}
                    sortMode={sortMode}
                    onChangeSortMode={setSortMode}
                />

                <div className="project-browser-content">
                    {!isLoadingProjects && projects.length === 0 ? (
                        <section className="dashboard-empty-state">
                            <h2>{user?.name || "User"}님, 환영합니다!</h2>
                            <p>나만의 가구를 디자인해보세요</p>
                            <button
                                className="button button-primary"
                                onClick={() => setIsCreateModalOpen(true)}
                            >
                                + 첫 프로젝트 만들기
                            </button>
                        </section>
                    ) : (
                        <ProjectGrid
                            projects={projects}
                            isLoading={isLoadingProjects}
                            viewMode={viewMode}
                            activeMenu={activeMenu}
                            openMenuProjectId={openMenuProjectId}
                            onToggleMenu={setOpenMenuProjectId}
                            onRenameClick={(project) => {
                                setRenameTarget(project);
                                setRenameValue(project.title);
                                setOpenMenuProjectId(null);
                            }}
                            onShareClick={(project) => {
                                setShareTarget(project);
                                setOpenMenuProjectId(null);
                            }}
                            onMoveStatus={handleMoveStatus}
                            onMoveToTrash={(projectId) => handleMoveStatus(projectId, "trash")}
                            onDuplicate={handleDuplicate}
                            onPermanentDelete={handlePermanentDelete}
                            onOpenProject={handleOpenProject}
                        />
                    )}
                </div>
            </div>

            {isCreateModalOpen && (
                <CreateProjectModal
                    value={projectTitle}
                    onChange={setProjectTitle}
                    onClose={() => {
                        setIsCreateModalOpen(false);
                        setProjectTitle("");
                    }}
                    onSubmit={handleCreateProject}
                />
            )}

            {renameTarget && (
                <RenameProjectModal
                    value={renameValue}
                    onChange={setRenameValue}
                    onClose={() => {
                        setRenameTarget(null);
                        setRenameValue("");
                    }}
                    onSubmit={handleRenameSubmit}
                />
            )}

            {shareTarget && (
                <ShareProjectModal
                    project={shareTarget}
                    onClose={() => setShareTarget(null)}
                    onShared={refreshCounts}
                />
            )}
        </AppShell>
    );
}