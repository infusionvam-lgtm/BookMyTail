import api from "../api";

// Fetch rooms with availability and filters
export const fetchRoomsAPI = async ({ checkIn, checkOut, guests, adminView = false }) => {
  const query = new URLSearchParams({ checkIn, checkOut, guests, adminView }).toString();
  const { data } = await api.get(`/rooms/getAll?${query}`, { withCredentials: true });
  return data;
};

// Fetch single room
export const fetchRoomByIdAPI = async ({ id, checkIn, checkOut }) => {
  const query = new URLSearchParams({ checkIn, checkOut }).toString();
  const { data } = await api.get(`/rooms/${id}?${query}`, { withCredentials: true });
  return data;
};

// Create room (multipart form-data)
export const createRoomAPI = async (roomData) => {
  const { data } = await api.post(`/rooms/create`, roomData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Update room (multipart form-data)
export const updateRoomAPI = async ({ id, updates }) => {
  const { data } = await api.put(`/rooms/${id}/update`, updates, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Delete room
export const deleteRoomAPI = async (id, count = 1) => {
  const { data } = await api.delete(`/rooms/${id}`, {
    data: { count },
    withCredentials: true,
  });
  return data;
};