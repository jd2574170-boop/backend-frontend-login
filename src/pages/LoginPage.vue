<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { defineStore } from "pinia";
import { useAuthStore } from "../stores/auth";
import { mensajeError } from "../services/api";

/* ---------- Store de Pinia propio del login (todo en este mismo archivo) ---------- */
const useLoginStore = defineStore("login-ui", {
  state: () => ({ cargando: false }),
});

const $q = useQuasar();
const router = useRouter();
const auth = useAuthStore();
const ui = useLoginStore();

const form = ref({ email: "", password: "" });
const verClave = ref(false);
const sacudir = ref(false);

const entrar = async () => {
  ui.cargando = true;
  try {
    await auth.login(form.value);
    $q.notify({
      type: "positive",
      icon: "waving_hand",
      message: `Bienvenido, ${(auth.usuario?.nombre || "").split(" ")[0]}`,
      timeout: 1800,
    });
    router.push("/cursos");
  } catch (e) {
    form.value.password = "";
    sacudir.value = true;
    setTimeout(() => (sacudir.value = false), 600);
    $q.notify({ type: "negative", icon: "error_outline", message: mensajeError(e) });
  } finally {
    ui.cargando = false;
  }
};
</script>

<template>
  <div class="login" :class="{ oscuro: $q.dark.isActive }">
    <!-- Fondo decorativo -->
    <div class="fondo">
      <span class="blob b1"></span>
      <span class="blob b2"></span>
      <span class="blob b3"></span>
      <span class="puntos"></span>
    </div>

    <q-btn class="btn-tema" round flat :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'" @click="$q.dark.toggle()">
      <q-tooltip>{{ $q.dark.isActive ? "Modo claro" : "Modo oscuro" }}</q-tooltip>
    </q-btn>

    <div class="contenido">
      <!-- Lado izquierdo: marca + frase -->
      <section class="hero">
        <div class="hero-marca">
          <div class="hero-logo"><q-icon name="school" size="26px" /></div>
          <span>Cursos y Aprendices</span>
        </div>

        <h1>
          Gestiona tus cursos y aprendices en
          <span class="resalte">un solo lugar.</span>
        </h1>

        <div class="hero-linea"></div>
      </section>

      <!-- Lado derecho: login -->
      <transition appear enter-active-class="animated fadeInUp">
        <div class="card" :class="{ sacudir }">
          <q-inner-loading :showing="ui.cargando" color="primary" label="Validando..." label-class="text-primary" />

          <div class="logo-mobile"><q-icon name="school" size="26px" /></div>

          <h2>Bienvenido</h2>
          <p class="sub">Inicia sesión para continuar</p>

          <q-form @submit.prevent="entrar" novalidate class="form">
            <q-input v-model="form.email" type="email" label="Correo electrónico" outlined autofocus
              hide-bottom-space no-error-icon lazy-rules="ondemand"
              :rules="[(v) => !!v || 'Escribe tu correo', (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Escribe un correo válido (ej: nombre@correo.com)']">
              <template #prepend><q-icon name="mail_outline" /></template>
            </q-input>

            <q-input v-model="form.password" :type="verClave ? 'text' : 'password'" label="Contraseña" outlined
              hide-bottom-space no-error-icon lazy-rules="ondemand"
              :rules="[(v) => !!v || 'Escribe tu contraseña']">
              <template #prepend><q-icon name="lock_outline" /></template>
              <template #append>
                <q-icon :name="verClave ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                  @click="verClave = !verClave" />
              </template>
            </q-input>

            <q-btn type="submit" label="Entrar" color="primary" unelevated no-caps size="lg" class="btn-entrar"
              v-ripple :loading="ui.cargando">
              <template #loading><q-spinner-dots /></template>
            </q-btn>
          </q-form>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.login {
  --muted: #6b7a86;
  position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: center;
  padding: 32px 28px; overflow: hidden;
}

/* ---------- Fondo ---------- */
.fondo {
  position: absolute; inset: 0; z-index: 0;
  background:
    radial-gradient(circle at 15% 20%, rgba(255, 255, 255, 0.10), transparent 40%),
    linear-gradient(135deg, #1b7f5c 0%, #145f46 40%, #0f2a2e 75%, #12202a 100%);
  transition: filter 0.4s;
}
.oscuro .fondo { filter: brightness(0.55) saturate(0.9); }

.puntos {
  position: absolute; inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.16) 1.2px, transparent 1.2px);
  background-size: 28px 28px;
  -webkit-mask-image: radial-gradient(ellipse at center, #000 20%, transparent 75%);
  mask-image: radial-gradient(ellipse at center, #000 20%, transparent 75%);
}
.blob { position: absolute; border-radius: 50%; animation: flotar 14s ease-in-out infinite; }
.b1 { width: 460px; height: 460px; top: -160px; right: -120px; background: rgba(255, 255, 255, 0.07); }
.b2 { width: 340px; height: 340px; bottom: -120px; left: -90px; background: rgba(224, 161, 0, 0.14); animation-delay: -5s; }
.b3 { width: 180px; height: 180px; top: 55%; right: 14%; background: rgba(255, 255, 255, 0.06); animation-delay: -9s; }
@keyframes flotar {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-26px) scale(1.05); }
}

.btn-tema { position: absolute; top: 16px; right: 16px; z-index: 5; color: rgba(255, 255, 255, 0.85); }

/* ---------- Distribución: frase a la izquierda, login a la derecha ---------- */
.contenido {
  position: relative; z-index: 2; width: 100%; max-width: 1120px;
  display: flex; align-items: center; justify-content: space-between; gap: 56px;
}

.hero { flex: 1; color: #fff; min-width: 0; }
.hero-marca { display: flex; align-items: center; gap: 12px; font-weight: 700; font-size: 16px; margin-bottom: 40px; }
.hero-logo {
  width: 46px; height: 46px; border-radius: 14px; display: flex; align-items: center; justify-content: center;
  background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.28); backdrop-filter: blur(6px);
}
.hero h1 {
  margin: 0; font-size: clamp(32px, 4.6vw, 56px); line-height: 1.12; font-weight: 800; letter-spacing: -0.03em;
}
.resalte { color: #f2c94c; }
.hero-linea { width: 72px; height: 5px; border-radius: 3px; background: #e0a100; margin-top: 32px; }

/* ---------- Tarjeta ---------- */
.card {
  position: relative; flex-shrink: 0; width: 100%; max-width: 410px; padding: 40px 38px 36px;
  border-radius: 22px; background: rgba(255, 255, 255, 0.97); border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.35), 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden; transition: background 0.3s;
}
.logo-mobile {
  display: none; width: 48px; height: 48px; border-radius: 14px; margin-bottom: 20px; color: #fff;
  align-items: center; justify-content: center;
  background: linear-gradient(135deg, #1b7f5c, #145f46); box-shadow: 0 6px 14px rgba(27, 127, 92, 0.35);
}
.card h2 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.02em; color: #12202a; }
.sub { margin: 6px 0 26px; color: var(--muted); font-size: 15px; }
.form { display: flex; flex-direction: column; gap: 18px; }
.btn-entrar { width: 100%; margin-top: 8px; height: 50px; border-radius: 12px; font-weight: 600; box-shadow: 0 8px 18px rgba(27, 127, 92, 0.3); }

/* ---------- Efectos ---------- */
.animated { animation-duration: 0.55s; animation-fill-mode: both; }
.fadeInUp { animation-name: fadeInUp; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }

.sacudir { animation: shake 0.5s; }
@keyframes shake {
  10%, 90% { transform: translateX(-2px); }
  20%, 80% { transform: translateX(4px); }
  30%, 50%, 70% { transform: translateX(-8px); }
  40%, 60% { transform: translateX(8px); }
}

/* ---------- Modo oscuro ---------- */
.oscuro .card { background: rgba(22, 34, 43, 0.96); border-color: #223340; }
.oscuro .card h2 { color: #fff; }

/* ---------- Pantallas pequeñas: solo el login ---------- */
@media (max-width: 760px) {
  .hero { display: none; }
  .contenido { justify-content: center; }
  .logo-mobile { display: flex; }
  .card { padding: 32px 24px 28px; }
}
</style>