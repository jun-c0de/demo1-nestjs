import api from './index';

export const getSharedWithMe = ({ search = '', sort = 'updatedAt_desc' } = {}) => {
    return api.get('/shares/with-me', { params: { sort, search: search.trim() } });
};

export const getSharedByMe = ({ search = '', sort = 'updatedAt_desc' } = {}) => {
    return api.get('/shares/by-me', { params: { sort, search: search.trim() } });
};

export const getProjectShares = (projectId) => api.get(`/shares/project/${projectId}`);
export const shareProject = (projectId, payload) => api.post(`/shares/${projectId}`, payload);
export const unshareProject = (shareId) => api.delete(`/shares/${shareId}`);