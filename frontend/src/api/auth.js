import api from "./index";

const ACCESS_TOKEN_KEY = "accessToken";

export const getToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const setToken = (token) => {
    if (!token) return;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
};
export const clearToken = () => localStorage.removeItem(ACCESS_TOKEN_KEY);

// alias exports
export const getAccessToken = getToken;
export const setAccessToken = setToken;
export const clearAccessToken = clearToken;

export async function signup(payload) {
    const data = await api.post("/auth/signup", payload);

    if (data?.accessToken) {
        setToken(data.accessToken);
    }

    return data;
}

export async function login(payload) {
    const data = await api.post("/auth/login", payload);

    if (data?.accessToken) {
        setToken(data.accessToken);
    }

    return data;
}

export const getMe = () => api.get("/auth/me");

export async function logout() {
    try {
        await api.post("/auth/logout");
    } finally {
        clearToken();
    }
}