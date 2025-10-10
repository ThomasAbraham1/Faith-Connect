import axios from "axios";
import { getNavigation } from "./navigationRef";

const baseURL = import.meta.env.VITE_APP_API_URL;
console.log(baseURL)
const api = axios.create({
  baseURL: `${baseURL}`,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(error)
    const navigate = getNavigation();
    if (error.response?.status === 403) {
      if (navigate) {
        navigate("/", {
          state: { error: "Your session is either expired or invalid. Please log in." },
        });
      }
    } else if (error.response?.data?.errorCode == 1100) {
      if (navigate) {
        navigate("/signup", {
          state: { error: error.response.data.message },
        }); 
      }
    }
    return Promise.reject(error);
  }
);

export default api;
