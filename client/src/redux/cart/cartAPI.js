import api from "../api.js"
// GET /cart → fetch user's cart
export const getCartAPI = async() => {
    const {data} = await api.get("/cart/get", {withCredentials: true})
    return data;
}
// POST /cart → save or update user's cart
export const saveCartAPI = async (cartData) => {
  try {
    const { data } = await api.post("/cart/save", cartData, { withCredentials: true });
    return data;
  } catch (error) {
    // Check if unauthorized
    if (error.response && error.response.status === 401) {
      // Navigate to login page
      window.location.href = "/login"; // or use your router navigation if in React Router
    }

    // Re-throw error so calling function can handle it if needed
    throw error;
  }
};
// DELETE /cart → clear user's cart
export const clearCartAPI = async() => {
    const {data} = await api.delete("/cart/delete", {withCredentials: true})
    return data;
}
