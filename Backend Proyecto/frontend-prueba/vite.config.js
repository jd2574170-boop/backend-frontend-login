import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { quasar } from "@quasar/vite-plugin";

export default defineConfig({
  plugins: [vue(), quasar()],
  base: './', // <-- Añade esta línea aquí para corregir las rutas en producción
  server: { port: 5173 },
});
