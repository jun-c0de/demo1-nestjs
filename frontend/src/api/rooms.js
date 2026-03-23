import http from "./http";

export function getRooms(floorplanId) {
    return http.get(`/floorplans/${floorplanId}/rooms`);
}

export function createRoom(floorplanId, payload) {
    return http.post(`/floorplans/${floorplanId}/rooms`, payload);
}

export function updateRoomMaterials(roomId, payload) {
    return http.patch(`/rooms/${roomId}/materials`, payload);
}

export function deleteRoom(roomId) {
    return http.delete(`/rooms/${roomId}`);
}