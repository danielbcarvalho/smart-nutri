import axios from "axios";
import { notify } from "../utils/notificationBus";

console.log("Environment API URL:", import.meta.env.VITE_API_URL);
console.log("Environment MODE:", import.meta.env.MODE);
console.log("All env vars:", import.meta.env);

// Ensure the API URL is absolute and doesn't get malformed
const apiUrl = import.meta.env.VITE_API_URL.startsWith("http")
  ? import.meta.env.VITE_API_URL
  : `https://${import.meta.env.VITE_API_URL}`;

console.log("Configured API URL:", apiUrl);

export const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Log the base URL configuration
console.log("Axios instance baseURL:", api.defaults.baseURL);

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("@smartnutri:token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Log the full request configuration
  console.log("Request URL:", config.url);
  console.log("Full Request Config:", {
    baseURL: config.baseURL,
    url: config.url,
    method: config.method,
    headers: config.headers,
  });

  return config;
});

// Interceptor para tratamento de erros globais
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("@smartnutri:token");
      window.location.href = "/login";
    } else if (error.response) {
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        "Ocorreu um erro ao processar sua solicitação.";
      notify(message, "error");
    } else if (error.request) {
      notify("Erro de conexão. Verifique sua internet.", "error");
    } else {
      notify("Erro inesperado. Tente novamente.", "error");
    }
    return Promise.reject(error);
  }
);
