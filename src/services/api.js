import axios from "axios";
import { useAuthStore } from "../stores/auth";
import router from "../router";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

// Inyecta el token en la cabecera x-token que espera el backend.
api.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.token) config.headers["x-token"] = auth.token;
  return config;
});

// 401 = token faltante, vencido o alterado: cerrar sesion y volver al login.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const auth = useAuthStore();
    if (error.response?.status === 401 && auth.token) {
      auth.logout();
      router.push("/login");
    }
    return Promise.reject(error);
  }
);

// Convierte cualquier error del backend en un texto legible.
export const mensajeError = (e) =>
  e.response?.data?.errors?.join(". ") ||
  e.response?.data?.msg ||
  "No hay conexion con el servidor";

export default api;