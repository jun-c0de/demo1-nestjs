import api from './index';

export const getProjects = ({ status = 'active', search = '', sort = 'updatedAt_desc' } = {}) => {
    return api.get('/projects', { params: { status, sort, search: search.trim() } });
};

export const getProjectCounts = () => api.get('/projects/counts');
export const createProject = (payload) => api.post('/projects', payload);
export const getProject = (projectId) => api.get(`/projects/${projectId}`);
export const renameProject = (projectId, payload) => api.patch(`/projects/${projectId}/title`, payload);
export const updateProjectStatus = (projectId, payload) => api.patch(`/projects/${projectId}/status`, payload);
export const duplicateProject = (projectId) => api.post(`/projects/${projectId}/duplicate`);
export const deleteProjectForever = (projectId) => api.delete(`/projects/${projectId}`);