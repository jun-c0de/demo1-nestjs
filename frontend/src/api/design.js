import api from './index';

export const getDesignsByProject = (projectId) => api.get(`/designs/project/${projectId}`);
export const createDesign = (projectId, payload) => api.post(`/designs/project/${projectId}`, payload);
export const getDesign = (projectId, designId) => api.get(`/designs/project/${projectId}/${designId}`);
export const updateDesign = (projectId, designId, payload) => api.patch(`/designs/project/${projectId}/${designId}`, payload);