import axios from "axios";
import { BASE_URL } from "../routes/utilites";

const api = axios.create({
    baseURL: BASE_URL,
     withCredentials: true,
})

api.interceptors.request.use((config) => {
    const token =localStorage.getItem("token");
    if (token){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't show toast here, let Redux handle it
    return Promise.reject(error);
  }
);

export default api;
