import http from "./http";

export function getFloorplans(projectId) {
    return http.get(`/projects/${projectId}/floorplans`);
}

export function createFloorplan(projectId, payload) {
    return http.post(`/projects/${projectId}/floorplans`, payload);
}

export function getFloorplan(floorplanId) {
    return http.get(`/floorplans/${floorplanId}`);
}

export function calibrateFloorplan(floorplanId, payload) {
    return http.patch(`/floorplans/${floorplanId}/calibrate`, payload);
}