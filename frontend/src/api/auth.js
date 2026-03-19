import api from './index';

export const setToken = (token) => localStorage.setItem('accessToken', token);
export const clearToken = () => localStorage.removeItem('accessToken');

export async function signup(payload) {
    const data = await api.post('/auth/signup', payload);
    if (data.accessToken) setToken(data.accessToken);
    return data;
}

export async function login(payload) {
    const data = await api.post('/auth/login', payload);
    if (data.accessToken) setToken(data.accessToken);
    return data;
}

export const getMe = () => api.get('/auth/me');

export async function logout() {
    await api.post('/auth/logout');
    clearToken();
}