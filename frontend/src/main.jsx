import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router"; // 기존 react-router 유지
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext"; // 1단계에서 만든 컨텍스트 임포트

// 기존 스타일 시트들 유지
import "./index.css";
import "./styles/globals.css";
import "./styles/layout.css";
import "./styles/components/header.css";
import "./styles/components/buttons.css";
import "./styles/components/modal.css";
import "./styles/components/project-card.css";
import "./styles/pages/landing.css";
import "./styles/pages/auth.css";
import "./styles/pages/dashboard.css";
import "./styles/pages/project-editor.css";
// import "./styles/pages/project-browser.css";

// 기존 테마 설정 로직 유지
const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* AuthProvider로 App을 감싸서 전역 인증 상태를 공급합니다 */}
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);