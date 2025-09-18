import api from "../api.js";


// ---------- User APIs ----------
export const createOrUpdateBookingAPI = async (bookingData) => {
  const { data } = await api.post("/bookings/cart", bookingData, { withCredentials: true });
  return data;
};
export const confirmBookingAPI = async ({ id, ...bookingData }) => {
  const { data } = await api.put(`/bookings/${id}/confirm`,bookingData,{ withCredentials: true });
  return data;
};

export const getMyBookingsAPI = async () => {
  const { data } = await api.get("/bookings/my", { withCredentials: true });
  return data;
};

export const cancelBookingAPI = async (id) => {
  const { data } = await api.put(`/bookings/${id}/cancel`, {}, { withCredentials: true });
  return data;
};





// ---------- Admin APIs ----------
export const getAllBookingsAPI = async (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  const { data } = await api.get(`/bookings/all?${query}`, { withCredentials: true });
  return data;
};

// Get metrics (total bookings, revenue, etc.)
export const getMetricsAPI = async (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  const { data } = await api.get(`/bookings/metrics?${query}`, { withCredentials: true });
  return data;
};
export const deleteBookingAdminAPI = async (id) => {
  const { data } = await api.delete(`/bookings/${id}/admin-delete`, { withCredentials: true });
  return data;
};
// Admin cancel booking
export const adminCancelBookingAPI = async (id) => {
  const { data } = await api.put(`/bookings/${id}/admin-cancel`, {}, { withCredentials: true });
  return data;
};

// Admin mark paid/unpaid
export const markBookingPaidAPI = async (id, status) => {
  const { data } = await api.put(`/bookings/${id}/mark-paid`, { status }, { withCredentials: true });
  return data;
};

// Admin approve refund
export const approveRefundAPI = async (id) => {
  const { data } = await api.put(`/bookings/${id}/refund`, {}, { withCredentials: true });
  return data;
};
