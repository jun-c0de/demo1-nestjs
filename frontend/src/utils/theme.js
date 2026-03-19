export const THEME_KEY = "theme";

export function getSavedTheme() {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem(THEME_KEY) || "light";
}

export function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
}

export function nextTheme(theme) {
    return theme === "light" ? "dark" : "light";
}