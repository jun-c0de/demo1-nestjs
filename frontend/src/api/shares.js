import http from "./http";

export function getSharedWithMe(params = {}) {
    return http.get("/shares/with-me", { params });
}

export function getSharedByMe(params = {}) {
    return http.get("/shares/by-me", { params });
}

export function getProjectShares(projectId) {
    return http.get(`/shares/project/${projectId}`);
}

export function shareProject(projectId, payload) {
    return http.post(`/shares/${projectId}`, payload);
}

export function unshareProject(shareId) {
    return http.delete(`/shares/${shareId}`);
}