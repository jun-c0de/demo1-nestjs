import { useEffect, useState } from "react";

const THEME_KEY = "theme";

export default function ThemeToggleButton() {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem(THEME_KEY) || "light";
    });

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

    function handleToggle() {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    }

    return (
        <button
            type="button"
            className="theme-toggle-btn"
            onClick={handleToggle}
            aria-label={theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환"}
        >
            <span className="theme-toggle-symbol">{theme === "light" ? "☾" : "☀"}</span>
        </button>
    );
}