import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://backend-philly-2.onrender.com/api",
  // baseURL: 'http://localhost:5000/api',
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);
export const BASE_IMAGE_URL = "https://api.phillycitytours.com";
// export const BASE_IMAGE_URL = 'http://localhost:5000';

/** Use when displaying images: supports full URLs (e.g. R2) or legacy paths. */
export function getImageUrl(pathOrUrl) {
  if (!pathOrUrl) return "";
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  // R2 URLs sometimes stored without protocol (e.g. pub-xxx.r2.dev/...)
  if (pathOrUrl.includes(".r2.dev") || pathOrUrl.includes("r2.cloudflarestorage.com")) {
    return pathOrUrl.startsWith("http") ? pathOrUrl : `https://${pathOrUrl}`;
  }
  return `${BASE_IMAGE_URL}${pathOrUrl.startsWith("/") ? pathOrUrl : "/" + pathOrUrl}`;
}

export default axiosInstance;
