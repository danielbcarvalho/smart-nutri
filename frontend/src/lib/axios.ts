import axios from "axios";
import { notify } from "../utils/notificationBus";

export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("@smartnutri:token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
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
