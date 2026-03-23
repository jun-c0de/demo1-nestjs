import http from "./http";

export function getProjects(params = {}) {
    return http.get("/projects", { params });
}

export function getProjectCounts() {
    return http.get("/projects/counts");
}

export function getProject(projectId) {
    return http.get(`/projects/${projectId}`);
}

export function createProject(payload) {
    return http.post("/projects", payload);
}

export function renameProject(projectId, payload) {
    return http.patch(`/projects/${projectId}/title`, payload);
}

export function updateProjectMeta(projectId, payload) {
    return http.patch(`/projects/${projectId}/meta`, payload);
}

export function updateProjectStatus(projectId, payload) {
    return http.patch(`/projects/${projectId}/status`, payload);
}

export function duplicateProject(projectId) {
    return http.post(`/projects/${projectId}/duplicate`);
}

export function deleteProjectForever(projectId) {
    return http.delete(`/projects/${projectId}`);
}