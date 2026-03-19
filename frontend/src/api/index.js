import axios from 'axios';

// 1. 공통 인스턴스 생성
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL + '/api',
    withCredentials: true, // 쿠키(Refresh Token) 전송을 위해 필수
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. 요청 인터셉터: 모든 요청 전에 실행됨 (기존 getAuthHeaders 역할)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 3. 응답 인터셉터: 에러 처리 및 데이터 가공 (기존 request 함수 내 에러 체크 역할)
api.interceptors.response.use(
    (response) => response.data, // .json() 과정 없이 바로 data만 반환
    (error) => {
        const message = error.response?.data?.message || '요청에 실패했습니다.';
        return Promise.reject(new Error(message));
    }
);

export default api;