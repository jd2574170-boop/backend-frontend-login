<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";
import { usuariosService } from "../services/usuarios.service";
import { mensajeError } from "../services/api";

const $q = useQuasar();
const vacio = () => ({ nombre: "", email: "", password: "" });
const form = ref(vacio());
const verClave = ref(false);
const cargando = ref(false);
const formRef = ref(null);

// Fuerza de la contraseña: devuelve 0 a 4 (se usa directo en la plantilla)
const fuerza = () => {
  const p = form.value.password || "";
  let puntos = 0;
  if (p.length >= 6) puntos++;
  if (p.length >= 10) puntos++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) puntos++;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) puntos++;
  return puntos;
};
const etiquetas = ["", "Débil", "Regular", "Buena", "Fuerte"];
const colores = ["grey-4", "negative", "warning", "info", "positive"];

const guardar = async () => {
  cargando.value = true;
  try {
    const { data } = await usuariosService.crear(form.value);
    $q.notify({ type: "positive", icon: "check_circle", message: data.msg });
    form.value = vacio();
    formRef.value?.resetValidation();
  } catch (e) {
    $q.notify({ type: "negative", icon: "error_outline", message: mensajeError(e) });
  } finally {
    cargando.value = false;
  }
};
</script>

<template>
  <!-- Fondo igual al del login -->
  <div class="fondo">
    <span class="blob b1"></span>
    <span class="blob b2"></span>
    <span class="blob b3"></span>
    <span class="puntos"></span>
  </div>

  <div class="pagina">
    <div class="encabezado">
      <h1>Usuarios</h1>
      <div class="contador">Crea cuentas para el equipo</div>
    </div>

    <transition appear enter-active-class="animated fadeInUp">
      <div class="tarjeta">
        <q-inner-loading :showing="cargando" color="primary" label="Guardando..." label-class="text-primary" />

        <div class="tarjeta-cabeza">
          <div class="tarjeta-icono"><q-icon name="person_add" size="24px" /></div>
          <div>
            <div class="tarjeta-titulo">Crear usuario</div>
            <div class="tarjeta-sub">Completa los datos de la nueva cuenta</div>
          </div>
        </div>

        <q-form ref="formRef" @submit.prevent="guardar" class="form">
          <q-input v-model="form.nombre" label="Nombre completo" outlined lazy-rules="ondemand"
            :rules="[(v) => !!v || 'El nombre es obligatorio']">
            <template #prepend><q-icon name="person_outline" /></template>
          </q-input>

          <q-input v-model="form.email" type="email" label="Correo electrónico" outlined lazy-rules="ondemand"
            :rules="[(v) => !!v || 'El correo es obligatorio']">
            <template #prepend><q-icon name="mail_outline" /></template>
          </q-input>

          <q-input v-model="form.password" :type="verClave ? 'text' : 'password'" label="Contraseña" outlined
            lazy-rules="ondemand" :rules="[(v) => (v && v.length >= 6) || 'Mínimo 6 caracteres']">
            <template #prepend><q-icon name="lock_outline" /></template>
            <template #append>
              <q-icon :name="verClave ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                @click="verClave = !verClave" />
            </template>
          </q-input>

          <!-- Indicador de fuerza de contraseña -->
          <div v-if="form.password" class="fuerza">
            <q-linear-progress :value="fuerza() / 4" :color="colores[fuerza()]" track-color="grey-3" rounded
              size="6px" />
            <span class="fuerza-texto">{{ etiquetas[fuerza()] }}</span>
          </div>

          <q-btn type="submit" label="Crear usuario" icon="person_add" color="primary" unelevated no-caps size="lg"
            class="btn-crear" v-ripple :loading="cargando">
            <template #loading><q-spinner-dots /></template>
          </q-btn>
        </q-form>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* ---------- Fondo (mismo estilo del login) ---------- */
.fondo {
  position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none;
  background:
    radial-gradient(circle at 15% 20%, rgba(255, 255, 255, 0.10), transparent 40%),
    linear-gradient(135deg, #1b7f5c 0%, #145f46 40%, #0f2a2e 75%, #12202a 100%);
}
.puntos {
  position: absolute; inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.16) 1.2px, transparent 1.2px);
  background-size: 28px 28px;
  -webkit-mask-image: radial-gradient(ellipse at center, #000 20%, transparent 80%);
  mask-image: radial-gradient(ellipse at center, #000 20%, transparent 80%);
}
.blob { position: absolute; border-radius: 50%; animation: flotar 14s ease-in-out infinite; }
.b1 { width: 460px; height: 460px; top: -160px; right: -120px; background: rgba(255, 255, 255, 0.07); }
.b2 { width: 340px; height: 340px; bottom: -120px; left: -90px; background: rgba(224, 161, 0, 0.14); animation-delay: -5s; }
.b3 { width: 180px; height: 180px; top: 55%; right: 8%; background: rgba(255, 255, 255, 0.06); animation-delay: -9s; }
@keyframes flotar {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-26px) scale(1.05); }
}

.pagina { position: relative; z-index: 1; padding: 8px 4px 24px; }

/* ---------- Encabezado ---------- */
.encabezado { margin-bottom: 20px; }
.encabezado h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.02em; color: #fff; }
.contador { margin-top: 2px; font-size: 14px; color: rgba(255, 255, 255, 0.75); }

/* ---------- Tarjeta ---------- */
.tarjeta {
  position: relative; max-width: 520px; padding: 32px 34px 34px; overflow: hidden;
  background: rgba(255, 255, 255, 0.97); border: 1px solid rgba(255, 255, 255, 0.6); border-radius: 20px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.32), 0 4px 12px rgba(0, 0, 0, 0.15);
}
.tarjeta-cabeza { display: flex; align-items: center; gap: 14px; margin-bottom: 26px; }
.tarjeta-icono {
  width: 50px; height: 50px; border-radius: 15px; color: #fff; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #1b7f5c, #145f46); box-shadow: 0 6px 14px rgba(27, 127, 92, 0.35);
}
.tarjeta-titulo { font-size: 21px; font-weight: 700; letter-spacing: -0.01em; color: #12202a; }
.tarjeta-sub { margin-top: 2px; font-size: 13.5px; color: #6b7a86; }

.form { display: flex; flex-direction: column; gap: 6px; }
.btn-crear { width: 100%; height: 50px; margin-top: 12px; border-radius: 12px; font-weight: 600; box-shadow: 0 8px 18px rgba(27, 127, 92, 0.3); }

/* Fuerza de contraseña */
.fuerza { display: flex; align-items: center; gap: 12px; margin: -4px 2px 6px; }
.fuerza :deep(.q-linear-progress) { flex: 1; }
.fuerza-texto { min-width: 54px; font-size: 12px; font-weight: 600; color: #6b7a86; text-align: right; }

/* ---------- Efecto de entrada ---------- */
.animated { animation-duration: 0.55s; animation-fill-mode: both; }
.fadeInUp { animation-name: fadeInUp; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }

@media (max-width: 600px) { .tarjeta { padding: 26px 22px 28px; } }
</style>