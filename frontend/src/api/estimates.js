import http from "./http";

export function getProjectEstimate(projectId) {
    return http.get(`/estimates/project/${projectId}`);
}