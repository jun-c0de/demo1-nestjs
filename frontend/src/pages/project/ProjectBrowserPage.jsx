import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { clearToken, getMe } from "../../api/auth";
import { getProject } from "../../api/projects";
import { createDesign, getDesignsByProject } from "../../api/designs";
import ThemeToggleButton from "../../components/ThemeToggleButton";
import CreateDesignModal from "./CreateDesignModal";
import ProjectItemGrid from "./ProjectItemGrid";

export default function ProjectBrowserPage() {
    const navigate = useNavigate();
    const { projectId } = useParams();

    const [user, setUser] = useState(null);
    const [project, setProject] = useState(null);
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isCreateDesignModalOpen, setIsCreateDesignModalOpen] = useState(false);
    const [designName, setDesignName] = useState("");

    useEffect(() => {
        async function initializePage() {
            try {
                const [meData, projectData, designData] = await Promise.all([
                    getMe(),
                    getProject(projectId),
                    getDesignsByProject(projectId),
                ]);

                setUser(meData);
                setProject(projectData);
                setItems(Array.isArray(designData) ? designData : []);
            } catch (error) {
                clearToken();
                navigate("/auth?mode=login", { replace: true });
            } finally {
                setIsLoading(false);
            }
        }

        initializePage();
    }, [navigate, projectId]);

    async function handleCreateDesign() {
        const trimmedName = designName.trim();

        if (!trimmedName) {
            alert("디자인 이름을 입력해주세요.");
            return;
        }

        try {
            const data = await createDesign(projectId, { name: trimmedName });
            setItems((prev) => [data, ...prev]);
            setIsCreateDesignModalOpen(false);
            setDesignName("");
            navigate(`/projects/${projectId}/designs/${data.id}`);
        } catch (error) {
            alert(error.message);
        }
    }

    function handleLogout() {
        clearToken();
        navigate("/", { replace: true });
    }

    function goDashboardMenu(menu) {
        navigate(`/dashboard?menu=${menu}`);
    }

    if (isLoading || !user || !project) {
        return (
            <div className="center-message-screen">
                <div className="center-message-box">프로젝트 불러오는 중...</div>
            </div>
        );
    }

    return (
        <div className="project-browser-shell">
            <header className="dashboard-topbar">
                <div className="brand-box" onClick={() => navigate("/dashboard")}>
                    <div className="brand-dots dashboard-brand-dots">
                        <span />
                        <span />
                        <span />
                    </div>
                    <span className="brand-text">CRAFT</span>
                </div>

                <div className="dashboard-top-actions">
                    <button type="button" className="icon-btn">🔔</button>
                    <button type="button" className="icon-btn">⚙</button>
                    <ThemeToggleButton />

                    <button type="button" className="user-chip" onClick={handleLogout}>
                        {user.avatar ? (
                            <img src={user.avatar} alt="user avatar" className="user-avatar" />
                        ) : (
                            <span className="user-avatar user-avatar-fallback">
                                {user.name?.slice(0, 1).toUpperCase()}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            <div className="project-browser-content">
                <aside className="dashboard-sidebar">
                    <button
                        type="button"
                        className="new-project-btn"
                        onClick={() => navigate("/dashboard")}
                    >
                        ＋ 새 프로젝트
                    </button>

                    <div className="sidebar-section-title">빠른 액세스</div>

                    <nav className="sidebar-nav">
                        <button
                            type="button"
                            className="sidebar-item sidebar-item-active"
                            onClick={() => goDashboardMenu("active")}
                        >
                            <span>진행중 프로젝트</span>
                        </button>

                        <button
                            type="button"
                            className="sidebar-item"
                            onClick={() => goDashboardMenu("completed")}
                        >
                            <span>완료된 프로젝트</span>
                        </button>

                        <button
                            type="button"
                            className="sidebar-item"
                            onClick={() => goDashboardMenu("sharedWithMe")}
                        >
                            <span>공유받은 파일</span>
                        </button>

                        <button
                            type="button"
                            className="sidebar-item"
                            onClick={() => goDashboardMenu("sharedByMe")}
                        >
                            <span>공유한 파일</span>
                        </button>

                        <button
                            type="button"
                            className="sidebar-item"
                            onClick={() => goDashboardMenu("trash")}
                        >
                            <span>휴지통</span>
                        </button>
                    </nav>
                </aside>

                <main className="project-browser-main">
                    <div className="project-browser-toolbar">
                        <div className="project-browser-toolbar-left">
                            <button
                                type="button"
                                className="project-browser-primary-btn"
                                onClick={() => setIsCreateDesignModalOpen(true)}
                            >
                                ＋ 새 디자인
                            </button>

                            <button
                                type="button"
                                className="project-browser-secondary-btn"
                                onClick={() => alert("새 폴더는 다음 단계에서 추가할게요.")}
                            >
                                ＋ 새 폴더
                            </button>

                            <div className="project-browser-breadcrumb">
                                <span className="project-browser-breadcrumb-root">내 프로젝트</span>
                                <span className="project-browser-divider">›</span>
                                <span className="project-browser-breadcrumb-section">진행중 프로젝트</span>
                                <span className="project-browser-divider">›</span>
                                <span className="project-browser-current">{project.title}</span>
                            </div>
                        </div>

                        <div className="project-browser-toolbar-right">
                            <input className="search-input" placeholder="검색..." />

                            <select className="toolbar-select" defaultValue="보통 아이콘">
                                <option>아주 큰 아이콘</option>
                                <option>큰 아이콘</option>
                                <option>보통 아이콘</option>
                                <option>목록</option>
                                <option>자세히</option>
                                <option>타일</option>
                            </select>

                            <select className="toolbar-select" defaultValue="수정일순">
                                <option>수정일순</option>
                                <option>이름순</option>
                                <option>종류순</option>
                            </select>
                        </div>
                    </div>

                    <div className="project-browser-grid-wrap">
                        <ProjectItemGrid projectId={projectId} items={items} />
                    </div>
                </main>
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
        </div>
    );
}