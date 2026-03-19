import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
    createProject,
    deleteProjectForever,
    duplicateProject,
    getProjectCounts,
    getProjects,
    renameProject,
    updateProjectStatus,
} from "../../api/project";
import { getSharedByMe, getSharedWithMe } from "../../api/share";

// 컴포넌트 임포트
import ThemeToggleButton from "../../components/ThemeToggleButton";
import DashboardSidebar from "./DashboardSidebar";
import DashboardToolbar from "./DashboardToolbar";
import ProjectGrid from "./ProjectGrid";
import CreateProjectModal from "./CreateProjectModal";
import RenameProjectModal from "./RenameProjectModal";
import ShareProjectModal from "./ShareProjectModal";

// 헬퍼 함수들
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
    const { user, logoutUser, loading: authLoading } = useAuth();

    const [projects, setProjects] = useState([]);
    const [counts, setCounts] = useState({
        active: 0,
        completed: 0,
        trash: 0,
        sharedWithMe: 0,
        sharedByMe: 0,
    });

    const [activeMenu, setActiveMenu] = useState("active");
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

    // 프로젝트 숫자 카운트 갱신
    async function refreshCounts() {
        try {
            const data = await getProjectCounts();
            setCounts(data.counts || data || {
                active: 0, completed: 0, trash: 0, sharedWithMe: 0, sharedByMe: 0
            });
        } catch (error) {
            console.error("Failed to fetch counts:", error);
        }
    }

    // 데이터 페칭 로직
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

                    const mapped = (data.items || []).map((item) => ({
                        id: item.project.id,
                        title: item.project.title,
                        fileCount: item.project.fileCount,
                        createdAt: item.project.createdAt,
                        updatedAt: item.project.updatedAt,
                        shareId: item.id,
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

                setProjects(data.projects || data || []);
                refreshCounts();
            } catch (error) {
                console.error("Fetch Items Error:", error);
            } finally {
                setIsLoadingProjects(false);
            }
        }

        const timeout = setTimeout(fetchItems, 300);
        return () => clearTimeout(timeout);
    }, [user, authLoading, activeMenu, searchKeyword, sortMode]);

    // 프로젝트 생성
    async function handleCreateProject() {
        const trimmedTitle = projectTitle.trim();
        if (!trimmedTitle) return alert("이름을 입력해주세요.");

        try {
            const data = await createProject({ title: trimmedTitle });
            if (activeMenu === "active") {
                setProjects((prev) => [data.project || data, ...prev]);
            }
            await refreshCounts();
            setIsCreateModalOpen(false);
            setProjectTitle("");
        } catch (error) {
            alert(error.message);
        }
    }

    // 상태 변경
    async function handleMoveStatus(projectId, status) {
        try {
            await updateProjectStatus(projectId, { status });
            setProjects((prev) => prev.filter((p) => p.id !== projectId));
            setOpenMenuProjectId(null);
            await refreshCounts();
        } catch (error) {
            alert(error.message);
        }
    }

    // 영구 삭제
    async function handlePermanentDelete(projectId) {
        if (!window.confirm("영구 삭제하시겠습니까?")) return;
        try {
            await deleteProjectForever(projectId);
            setProjects((prev) => prev.filter((p) => p.id !== projectId));
            setOpenMenuProjectId(null);
            await refreshCounts();
        } catch (error) {
            alert(error.message);
        }
    }

    // 복제
    async function handleDuplicate(projectId) {
        try {
            const data = await duplicateProject(projectId);
            if (activeMenu === "active") {
                setProjects((prev) => [data.project || data, ...prev]);
            }
            await refreshCounts();
            setOpenMenuProjectId(null);
        } catch (error) {
            alert(error.message);
        }
    }

    // 이름 변경 제출
    async function handleRenameSubmit() {
        const trimmedTitle = renameValue.trim();
        if (!trimmedTitle || !renameTarget) return;

        try {
            const data = await renameProject(renameTarget.id, { title: trimmedTitle });
            setProjects((prev) =>
                prev.map((p) => (p.id === renameTarget.id ? (data.project || data) : p))
            );
            setRenameTarget(null);
        } catch (error) {
            alert(error.message);
        }
    }

    const currentSectionTitle = useMemo(() => {
        const titles = {
            completed: "완료된 프로젝트",
            trash: "휴지통",
            sharedWithMe: "공유받은 파일",
            sharedByMe: "공유한 파일",
            active: "진행중 프로젝트"
        };
        return titles[activeMenu] || "프로젝트";
    }, [activeMenu]);

    if (authLoading) {
        return (
            <div className="center-message-screen">
                <div className="center-message-box">인증 확인 중...</div>
            </div>
        );
    }

    return (
        <div className={`dashboard-shell ${isCreateModalOpen ? "dashboard-modal-open" : ""}`}>
            <header className="dashboard-topbar">
                <div className="brand-box" onClick={() => navigate("/dashboard")}>
                    <div className="brand-dots dashboard-brand-dots">
                        <span /><span /><span />
                    </div>
                    <span className="brand-text">CRAFT</span>
                </div>

                <div className="dashboard-top-actions">
                    <button type="button" className="icon-btn">🔔</button>
                    <button type="button" className="icon-btn">⚙</button>
                    <ThemeToggleButton />

                    <div className="user-profile-header">
                        {user?.picture ? (
                            <img src={user.picture} alt="profile" className="header-avatar" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                        ) : (
                            <div className="header-avatar-fallback" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {user?.name?.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="dashboard-content">
                <DashboardSidebar
                    user={user}
                    counts={counts}
                    activeMenu={activeMenu}
                    onMenuChange={setActiveMenu}
                    onCreateProject={() => setIsCreateModalOpen(true)}
                    onLogout={logoutUser}
                />

                <main className="dashboard-main">
                    <DashboardToolbar
                        currentSectionTitle={currentSectionTitle}
                        searchKeyword={searchKeyword}
                        onSearchChange={setSearchKeyword}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        sortMode={sortMode}
                        onSortModeChange={setSortMode}
                    />

                    <div className="project-display-area">
                        {!isLoadingProjects && projects.length === 0 ? (
                            <div className="empty-dashboard-state">
                                <h2 className="welcome-text">
                                    <strong>{user?.name || 'User'}</strong>님, 환영합니다!
                                </h2>
                                <p className="sub-text">나만의 가구를 디자인해보세요</p>
                                <button
                                    className="main-create-btn"
                                    onClick={() => setIsCreateModalOpen(true)}
                                >
                                    + 첫 프로젝트 만들기
                                </button>
                            </div>
                        ) : (
                            <ProjectGrid
                                projects={projects}
                                isLoading={isLoadingProjects}
                                viewMode={viewMode}
                                activeMenu={activeMenu}
                                openMenuProjectId={openMenuProjectId}
                                onToggleMenu={setOpenMenuProjectId}
                                onRenameClick={(p) => { setRenameTarget(p); setRenameValue(p.title); setOpenMenuProjectId(null); }}
                                onShareClick={(p) => { setShareTarget(p); setOpenMenuProjectId(null); }}
                                onMoveStatus={handleMoveStatus}
                                onMoveToTrash={(id) => handleMoveStatus(id, "trash")}
                                onDuplicate={handleDuplicate}
                                onPermanentDelete={handlePermanentDelete}
                            />
                        )}
                    </div>
                </main>
            </div>

            <footer className="dashboard-footer">
                <div className="footer-left-info">
                    <span className="footer-item">{projects.length}개 항목</span>
                </div>
            </footer>

            {isCreateModalOpen && (
                <CreateProjectModal
                    value={projectTitle}
                    onChange={setProjectTitle}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={handleCreateProject}
                />
            )}

            {renameTarget && (
                <RenameProjectModal
                    value={renameValue}
                    onChange={setRenameValue}
                    onClose={() => setRenameTarget(null)}
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
        </div>
    );
}