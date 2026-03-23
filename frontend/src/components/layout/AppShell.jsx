import Topbar from "./Topbar";
import Sidebar from "./Sidebar";

export default function AppShell({
    children,
    user,
    activeMenu,
    counts,
    onChangeMenu,
    onCreateClick,
    onLogout,
    onGoDashboard,
}) {
    return (
        <div className="app-shell">
            <Topbar
                user={user}
                onCreateClick={onCreateClick}
                onLogout={onLogout}
                onGoDashboard={onGoDashboard}
            />

            <div className="app-shell__body">
                <Sidebar
                    activeMenu={activeMenu}
                    counts={counts}
                    onChangeMenu={onChangeMenu}
                />

                <main className="app-shell__content">{children}</main>
            </div>
        </div>
    );
}