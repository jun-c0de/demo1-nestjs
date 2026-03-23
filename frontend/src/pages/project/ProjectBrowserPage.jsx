import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppShell from "../../components/layout/AppShell";
import { useAuth } from "../../contexts/AuthContext";
import ProjectBrowserToolbar from "./ProjectBrowserToolbar.jsx";
import ProjectBrowserGrid from "./ProjectBrowserGrid";

export default function ProjectBrowserPage() {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const { user, logoutUser } = useAuth();

    const [activeMenu, setActiveMenu] = useState("active");
    const [counts, setCounts] = useState({
        active: 0,
        completed: 0,
        trash: 0,
        sharedWithMe: 0,
        sharedByMe: 0,
    });

    const [viewMode, setViewMode] = useState("보통 아이콘");
    const [sortMode, setSortMode] = useState("수정일순");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [items, setItems] = useState([]);

    useEffect(() => {
        // 여기서 projectId 기준 디자인/도면 목록 fetch
    }, [projectId, searchKeyword, sortMode]);

    const pageTitle = useMemo(() => "프로젝트 파일", []);

    return (
        <AppShell
            user={user}
            activeMenu={activeMenu}
            counts={counts}
            onChangeMenu={setActiveMenu}
            onCreateClick={() => navigate("/dashboard")}
            onLogout={logoutUser}
            onGoDashboard={() => navigate("/dashboard")}
        >
            <section className="project-browser-page">
                <ProjectBrowserToolbar
                    title={pageTitle}
                    searchKeyword={searchKeyword}
                    onChangeSearchKeyword={setSearchKeyword}
                    viewMode={viewMode}
                    onChangeViewMode={setViewMode}
                    sortMode={sortMode}
                    onChangeSortMode={setSortMode}
                    onCreateDesign={() => { }}
                    onCreateFolder={() => { }}
                />

                <div className="project-browser-main">
                    <ProjectBrowserGrid
                        items={items}
                        viewMode={viewMode}
                        onOpenItem={(item) => { }}
                    />
                </div>

                <div className="project-browser-footer">
                    {items.length}개 항목
                </div>
            </section>
        </AppShell>
    );
}