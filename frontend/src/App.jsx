import { Navigate, Route, Routes } from "react-router";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import OAuthSuccessPage from "./pages/OAuthSuccessPage"; // 추가됨
import DashboardPage from "./pages/dashboard/DashboardPage";
import ProjectBrowserPage from "./pages/project/ProjectBrowserPage";
import ProjectEditorPage from "./pages/editor/ProjectEditorPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* 1. 누구나 접근 가능한 페이지 */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      {/* 구글 로그인 리다이렉트 경로 추가 */}
      <Route path="/oauth-success" element={<OAuthSuccessPage />} />

      {/* 2. 로그인한 사용자만 접근 가능한 페이지 (중첩 라우팅) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects/:projectId" element={<ProjectBrowserPage />} />
        <Route path="/projects/:projectId/designs/:designId" element={<ProjectEditorPage />} />
      </Route>

      {/* 3. 정의되지 않은 경로는 홈으로 리다이렉트 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}