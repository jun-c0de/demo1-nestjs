import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const http = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

let isRefreshing = false;
let pendingQueue = [];

function processQueue(error, token = null) {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    pendingQueue = [];
}

http.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

http.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const message =
            error.response?.data?.message || "요청에 실패했습니다.";

        if (
            status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/auth/login") &&
            !originalRequest.url?.includes("/auth/signup") &&
            !originalRequest.url?.includes("/auth/refresh")
        ) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pendingQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return http(originalRequest);
                });
            }

            isRefreshing = true;

            try {
                const refreshResponse = await axios.post(
                    `${BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                const newAccessToken = refreshResponse.data?.accessToken;
                if (!newAccessToken) {
                    throw new Error("토큰 재발급 실패");
                }

                localStorage.setItem("accessToken", newAccessToken);
                processQueue(null, newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return http(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem("accessToken");
                processQueue(refreshError, null);
                window.location.href = "/auth?mode=login";
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(new Error(message));
    }
);

export default http;