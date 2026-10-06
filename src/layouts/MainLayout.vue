<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const router = useRouter();

const enlaces = [
  { to: "/cursos", label: "Cursos", icon: "menu_book" },
  { to: "/aprendices", label: "Aprendices", icon: "school" },
  { to: "/usuarios", label: "Usuarios", icon: "manage_accounts" },
];

const iniciales = () =>
  (auth.usuario?.nombre || "U")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const salir = () => {
  auth.logout();
  router.push("/login");
};
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="cabecera">
      <q-toolbar class="barra">
        <!-- Marca -->
        <div class="marca" @click="router.push('/cursos')">
          <div class="marca-logo"><q-icon name="school" size="22px" /></div>
          <span class="marca-texto">Cursos y Aprendices</span>
        </div>

        <q-space />

        <!-- Navegación -->
        <nav class="nav">
          <q-btn v-for="e in enlaces" :key="e.to" :to="e.to" flat no-caps v-ripple class="nav-link"
            active-class="nav-activo">
            <q-icon :name="e.icon" size="20px" />
            <span class="nav-texto">{{ e.label }}</span>
            <q-tooltip class="lt-md">{{ e.label }}</q-tooltip>
          </q-btn>
        </nav>

        <div class="separador"></div>

        <!-- Usuario -->
        <q-btn flat no-caps class="usuario" padding="4px 8px 4px 4px">
          <div class="avatar">{{ iniciales() }}</div>
          <div class="usuario-datos gt-xs">
            <div class="usuario-nombre">{{ auth.usuario?.nombre }}</div>
            <div class="usuario-rol">{{ auth.usuario?.rol }}</div>
          </div>
          <q-icon name="expand_more" size="20px" class="gt-xs q-ml-xs" />

          <q-menu anchor="bottom right" self="top right" :offset="[0, 10]" class="menu-usuario"
            transition-show="jump-down" transition-hide="jump-up">
            <div class="menu-cabeza">
              <div class="avatar avatar-grande">{{ iniciales() }}</div>
              <div class="menu-datos">
                <div class="menu-nombre">{{ auth.usuario?.nombre }}</div>
                <div class="menu-correo">{{ auth.usuario?.email }}</div>
              </div>
            </div>
            <q-separator />
            <q-list padding>
              <q-item clickable v-close-popup v-ripple class="menu-salir" @click="salir">
                <q-item-section avatar><q-icon name="logout" color="negative" /></q-item-section>
                <q-item-section>Cerrar sesión</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page padding><router-view /></q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
/* ---------- Cabecera ---------- */
.cabecera {
  background: linear-gradient(90deg, #12202a 0%, #0f2a2e 60%, #12302f 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.28);
}
.cabecera::after {
  content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 2px;
  background: linear-gradient(90deg, transparent, #1b7f5c 25%, #e0a100 50%, #1b7f5c 75%, transparent);
  opacity: 0.8;
}
.barra { min-height: 64px; padding: 0 20px; gap: 8px; }

/* ---------- Marca ---------- */
.marca { display: flex; align-items: center; gap: 12px; cursor: pointer; user-select: none; }
.marca-logo {
  width: 40px; height: 40px; border-radius: 12px; color: #fff;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #1b7f5c, #145f46);
  box-shadow: 0 6px 14px rgba(27, 127, 92, 0.4);
}
.marca-texto { font-size: 17px; font-weight: 700; letter-spacing: -0.01em; color: #fff; }

/* ---------- Navegación ---------- */
.nav { display: flex; align-items: center; gap: 6px; }
.nav-link {
  height: 40px; padding: 0 16px; border-radius: 10px; color: #b4c2cc;
  font-size: 14px; font-weight: 600; transition: background 0.2s, color 0.2s;
}
.nav-link:hover { background: rgba(255, 255, 255, 0.08); color: #fff; }
.nav-texto { margin-left: 8px; }
.nav-activo { background: #1b7f5c !important; color: #fff !important; box-shadow: 0 6px 14px rgba(27, 127, 92, 0.35); }

.separador { width: 1px; height: 30px; margin: 0 14px; background: rgba(255, 255, 255, 0.14); }

/* ---------- Usuario ---------- */
.usuario { border-radius: 12px; color: #fff; }
.usuario:hover { background: rgba(255, 255, 255, 0.08); }
.avatar {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #e0a100, #c98a00); color: #12202a; font-size: 13px; font-weight: 800;
}
.usuario-datos { margin-left: 10px; text-align: left; line-height: 1.2; }
.usuario-nombre { max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; font-weight: 600; text-transform: capitalize; }
.usuario-rol { font-size: 11px; letter-spacing: 0.06em; color: #8fa1ae; }

/* ---------- Menú desplegable ---------- */
.menu-usuario { min-width: 250px; border-radius: 14px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3); }
.menu-cabeza { display: flex; align-items: center; gap: 12px; padding: 16px; }
.avatar-grande { width: 44px; height: 44px; font-size: 15px; }
.menu-datos { min-width: 0; }
.menu-nombre { font-weight: 700; color: #12202a; text-transform: capitalize; }
.menu-correo { font-size: 12.5px; color: #6b7a86; overflow: hidden; text-overflow: ellipsis; }
.menu-salir { border-radius: 10px; margin: 0 8px; color: #c10015; font-weight: 600; }

/* ---------- Pantallas pequeñas ---------- */
@media (max-width: 1023px) {
  .nav-texto { display: none; }
  .nav-link { padding: 0 12px; }
}
@media (max-width: 599px) {
  .marca-texto { display: none; }
  .barra { padding: 0 10px; }
  .separador { margin: 0 6px; }
}
</style>