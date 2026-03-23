import http from "./http";

export function setAccessToken(token) {
    localStorage.setItem("accessToken", token);
}

export function clearAccessToken() {
    localStorage.removeItem("accessToken");
}

export async function signup(payload) {
    const data = await http.post("/auth/signup", payload);
    if (data?.accessToken) setAccessToken(data.accessToken);
    return data;
}

export async function login(payload) {
    const data = await http.post("/auth/login", payload);
    if (data?.accessToken) setAccessToken(data.accessToken);
    return data;
}

export async function logout() {
    await http.post("/auth/logout");
    clearAccessToken();
}

export async function getMe() {
    return http.get("/auth/me");
}

export function getGoogleLoginUrl() {
    return `${import.meta.env.VITE_API_BASE_URL}/api/auth/google`;
}