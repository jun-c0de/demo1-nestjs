import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";

import "./index.css";

import "./styles/tokens.css";
import "./styles/globals.css";
import "./styles/layout.css";

import "./styles/layout/app-shell.css";
import "./styles/layout/topbar.css";
import "./styles/layout/sidebar.css";

import "./styles/components/header.css";
import "./styles/components/buttons.css";
import "./styles/components/modal.css";
import "./styles/components/project-card.css";
import "./styles/components/profile-menu.css";

import "./styles/pages/landing.css";
import "./styles/pages/auth.css";
import "./styles/pages/dashboard.css";
import "./styles/pages/project-editor.css";
import "./styles/pages/project-browser.css";

const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);