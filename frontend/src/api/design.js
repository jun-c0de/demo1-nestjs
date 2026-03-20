import api from './index';

export const getDesignsByProject = (projectId) =>
    api.get(`/projects/${projectId}/designs`);

export const createDesign = (projectId, payload) =>
    api.post(`/projects/${projectId}/designs`, payload);

export const getDesign = (projectId, designId) =>
    api.get(`/projects/${projectId}/designs/${designId}`);

export const updateDesign = (projectId, designId, payload) =>
    api.patch(`/projects/${projectId}/designs/${designId}`, payload);

export const deleteDesign = (projectId, designId) =>
    api.delete(`/projects/${projectId}/designs/${designId}`);