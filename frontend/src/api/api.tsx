import axios from "axios";
import { getNavigation } from "./navigationRef";

const baseURL = import.meta.env.VITE_APP_API_URL;
const api = axios.create({
  baseURL: `${baseURL}`,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(error)
    if (error.response?.status === 403) {
      const navigate = getNavigation();
      if (navigate) {
        navigate("/", {
          state: { error: "Your session is either expired or invalid. Please log in." },
        });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
