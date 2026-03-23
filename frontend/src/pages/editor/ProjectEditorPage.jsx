import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { clearToken, getMe } from "../../api/auth";
import { getProject } from "../../api/projects";
import { getDesign, updateDesign } from "../../api/designs";
import ThemeToggleButton from "../../components/ThemeToggleButton";
import { useProjectEditorStore } from "../stores/projectEditorStore";
import ProjectEditorSidebar from "./ProjectEditorSidebar";
import ProjectEditorCanvas from "./ProjectEditorCanvas";
import ProjectEditorInspector from "./ProjectEditorInspector";

export default function ProjectEditorPage() {
    const navigate = useNavigate();
    const { projectId, designId } = useParams();

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const project = useProjectEditorStore((state) => state.project);
    const design = useProjectEditorStore((state) => state.design);
    const room = useProjectEditorStore((state) => state.room);
    const editorData = useProjectEditorStore((state) => state.editorData);

    const setProject = useProjectEditorStore((state) => state.setProject);
    const setDesign = useProjectEditorStore((state) => state.setDesign);

    useEffect(() => {
        async function initializePage() {
            try {
                const [meData, projectData, designData] = await Promise.all([
                    getMe(),
                    getProject(projectId),
                    getDesign(projectId, designId),
                ]);

                setUser(meData);
                setProject(projectData);
                setDesign(designData);
            } catch (error) {
                console.error(error);
                clearToken();
                navigate("/auth?mode=login", { replace: true });
            } finally {
                setIsLoading(false);
            }
        }

        initializePage();
    }, [navigate, projectId, designId, setProject, setDesign]);

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

    function handleLogout() {
        clearToken();
        navigate("/", { replace: true });
    }

    if (isLoading || !user || !project || !design) {
        return (
            <div className="center-message-screen">
                <div className="center-message-box">디자인 불러오는 중...</div>
            </div>
        );
    }

    return (
        <div className="editor-page">
            <header className="editor-header">
                <div className="editor-header-left">
                    <div className="brand-box" onClick={() => navigate("/dashboard")}>
                        <div className="brand-dots dashboard-brand-dots">
                            <span />
                            <span />
                            <span />
                        </div>
                        <span className="brand-text">CRAFT</span>
                    </div>

                    <div className="editor-header-actions">
                        <button type="button" className="editor-header-btn">
                            파일
                        </button>
                        <button type="button" className="editor-header-btn" onClick={handleSave}>
                            저장
                        </button>
                        <button type="button" className="editor-header-btn" onClick={handleExit}>
                            저장하고 나가기
                        </button>
                    </div>
                </div>

                <div className="editor-header-center">
                    <span className="editor-header-path">◦◦</span>
                    <span className="editor-header-divider">›</span>
                    <span className="editor-header-path">{project.title}</span>
                    <span className="editor-header-divider">›</span>
                    <span className="editor-header-current">{design.name}</span>
                </div>

                <div className="editor-header-right">
                    <button type="button" className="editor-header-ghost-btn">
                        조작법
                    </button>

                    <button type="button" className="editor-header-primary-btn">
                        컨버팅
                    </button>

                    <button type="button" className="user-chip" onClick={handleLogout}>
                        {user.avatar ? (
                            <img src={user.avatar} alt="user avatar" className="user-avatar" />
                        ) : (
                            <span className="user-avatar user-avatar-fallback">
                                {user.name?.slice(0, 1).toUpperCase()}
                            </span>
                        )}
                    </button>

                    <button type="button" className="icon-btn">
                        ⚙
                    </button>
                    <ThemeToggleButton />
                </div>
            </header>

            <div className="editor-tabbar">
                <button type="button" className="editor-tabbar-menu-btn">
                    ☰
                </button>

                <div className="editor-tabs">
                    <button type="button" className="editor-tab">
                        ◦◦ /{project.title}
                    </button>

                    <button type="button" className="editor-tab active">
                        ◦◦ /{design.name} ✕
                    </button>

                    <button type="button" className="editor-tab add" onClick={handleExit}>
                        ＋ 디자인 생성
                    </button>
                </div>
            </div>

            <div className="editor-body">
                <aside className="editor-left-column">
                    <ProjectEditorSidebar />
                </aside>

                <section className="editor-center-column">
                    <div className="editor-viewer-shell">
                        <ProjectEditorCanvas />
                    </div>
                </section>

                <aside className="editor-right-column">
                    <ProjectEditorInspector />
                </aside>
            </div>
        </div>
    );
}