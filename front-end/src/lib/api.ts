import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      // Handle unauthorized access, e.g., redirect to login page
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  },
);

export const getCsrfCookie = () => {
  return api.get("/sanctum/csrf-cookie");
};

export default api;
