import axios from "axios";
import { clearToken, getToken, setToken } from "./auth";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

let refreshPromise = null;

async function refreshAccessToken() {
    if (!refreshPromise) {
        refreshPromise = axios
            .post(
                `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`,
                {},
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
            .then((response) => {
                const nextToken = response?.data?.accessToken;

                if (!nextToken) {
                    throw new Error("새 액세스 토큰을 받지 못했습니다.");
                }

                setToken(nextToken);
                return nextToken;
            })
            .catch((error) => {
                clearToken();
                throw error;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
}

api.interceptors.request.use((config) => {
    const token = getToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        const isRefreshRequest = originalRequest?.url?.includes("/auth/refresh");

        if (status === 401 && !originalRequest?._retry && !isRefreshRequest) {
            originalRequest._retry = true;

            try {
                const nextToken = await refreshAccessToken();
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${nextToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                const message =
                    refreshError.response?.data?.message ||
                    refreshError.message ||
                    "로그인이 만료되었습니다.";

                return Promise.reject(new Error(message));
            }
        }

        const message =
            error.response?.data?.message || error.message || "요청에 실패했습니다.";

        return Promise.reject(new Error(message));
    }
);

export default api;