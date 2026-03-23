import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import AuthPage from "../pages/AuthPage";
import OAuthSuccessPage from "../pages/OAuthSuccessPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import ProjectBrowserPage from "../pages/project/ProjectBrowserPage";
import ProjectEditorPage from "../pages/editor/ProjectEditorPage";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/success" element={<OAuthSuccessPage />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/projects/:projectId" element={<ProjectBrowserPage />} />
                <Route
                    path="/projects/:projectId/designs/:designId"
                    element={<ProjectEditorPage />}
                />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}