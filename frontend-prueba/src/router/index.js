import { createRouter, createWebHashHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

const routes = [
  { path: "/login", name: "login", component: () => import("../pages/LoginPage.vue"), meta: { publica: true } },
  {
    path: "/",
    component: () => import("../layouts/MainLayout.vue"),
    redirect: "/cursos",
    children: [
      { path: "cursos", name: "cursos", component: () => import("../pages/CursosPage.vue") },
      { path: "aprendices", name: "aprendices", component: () => import("../pages/AprendicesPage.vue") },
      { path: "usuarios", name: "usuarios", component: () => import("../pages/UsuariosPage.vue") },
    ],
  },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

// Hash mode: el backend sirve el build desde /public y asi las URLs directas funcionan.
const router = createRouter({ history: createWebHashHistory(), routes });

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (!to.meta.publica && !auth.isAuth) return { name: "login" };
  if (to.name === "login" && auth.isAuth) return { name: "cursos" };
});

export default router;
