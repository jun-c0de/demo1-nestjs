import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./app/AppRouter";
import { AuthProvider } from "./contexts/AuthContext";

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

const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);