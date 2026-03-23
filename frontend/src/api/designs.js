import http from "./http";

export function getDesignsByProject(projectId) {
    return http.get(`/projects/${projectId}/designs`);
}

export function getDesign(projectId, designId) {
    return http.get(`/projects/${projectId}/designs/${designId}`);
}

export function createDesign(projectId, payload) {
    return http.post(`/projects/${projectId}/designs`, payload);
}

export function updateDesign(projectId, designId, payload) {
    return http.patch(`/projects/${projectId}/designs/${designId}`, payload);
}

export function deleteDesign(projectId, designId) {
    return http.delete(`/projects/${projectId}/designs/${designId}`);
}