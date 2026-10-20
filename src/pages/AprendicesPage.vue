<script setup>
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import { aprendicesService } from "../services/aprendices.service";
import { cursosService } from "../services/cursos.service";
import { mensajeError } from "../services/api";

const $q = useQuasar();
const aprendices = ref([]);
const cursos = ref([]);
const opcionesCurso = ref([]);
const buscar = ref("");
const filtroCurso = ref(null);
const cargando = ref(false);
const dialogo = ref(false);
const editandoId = ref(null);
const paginacion = ref({ rowsPerPage: 10 });
const form = ref({ documento: "", nombre: "", email: "", curso: null });

const iniciales = (n = "") =>
  n.split(" ").filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase();

const columnas = [
  { name: "nombre", label: "Aprendiz", field: "nombre", align: "left", sortable: true },
  { name: "documento", label: "Documento", field: "documento", align: "left", sortable: true },
  { name: "curso", label: "Curso", field: (r) => r.curso?.nombre || "Sin curso", align: "left", sortable: true },
  { name: "status", label: "Estado", field: "status", align: "center" },
  { name: "acciones", label: "", align: "right" },
];

// Busca por nombre, documento, correo o curso
const filtrar = (filas, texto) => {
  const t = texto.toLowerCase();
  return filas.filter(
    (r) =>
      r.nombre?.toLowerCase().includes(t) ||
      r.documento?.toLowerCase().includes(t) ||
      r.email?.toLowerCase().includes(t) ||
      r.curso?.nombre?.toLowerCase().includes(t)
  );
};

const cargar = async () => {
  cargando.value = true;
  try {
    const { data } = filtroCurso.value
      ? await aprendicesService.porCurso(filtroCurso.value)
      : await aprendicesService.listar();
    aprendices.value = data;
  } catch (e) {
    $q.notify({ type: "negative", message: mensajeError(e) });
  } finally {
    cargando.value = false;
  }
};

const abrir = (a) => {
  editandoId.value = a?._id || null;
  form.value = a
    ? { documento: a.documento, nombre: a.nombre, email: a.email, curso: a.curso?._id || null }
    : { documento: "", nombre: "", email: "", curso: null };
  dialogo.value = true;
};

const guardar = async () => {
  try {
    const { data } = editandoId.value
      ? await aprendicesService.actualizar(editandoId.value, form.value)
      : await aprendicesService.crear(form.value);
    $q.notify({ type: "positive", icon: "check_circle", message: data.msg });
    dialogo.value = false;
    cargar();
  } catch (e) {
    $q.notify({ type: "negative", icon: "error_outline", message: mensajeError(e) });
  }
};

const cambiarEstado = async (a) => {
  try {
    const { data } = a.status === 0 ? await aprendicesService.desactivar(a._id) : await aprendicesService.activar(a._id);
    $q.notify({ type: "positive", icon: "check_circle", message: data.msg });
    cargar();
  } catch (e) {
    $q.notify({ type: "negative", icon: "error_outline", message: mensajeError(e) });
  }
};

onMounted(async () => {
  try {
    cursos.value = (await cursosService.listar()).data;
    opcionesCurso.value = cursos.value
      .filter((c) => c.status === 0)
      .map((c) => ({ label: `${c.codigo} - ${c.nombre}`, value: c._id }));
  } catch (e) {
    $q.notify({ type: "negative", message: mensajeError(e) });
  }
  cargar();
});
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
    <!-- Encabezado -->
    <div class="encabezado">
      <div>
        <h1>Aprendices</h1>
        <div class="contador">{{ aprendices.length }} registrados</div>
      </div>

      <div class="herramientas">
        <q-input v-model="buscar" dense outlined clearable placeholder="Buscar aprendiz..." bg-color="white"
          class="buscador">
          <template #prepend><q-icon name="search" /></template>
        </q-input>

        <q-select v-model="filtroCurso" :options="opcionesCurso" emit-value map-options clearable dense outlined
          bg-color="white" label="Filtrar por curso" class="filtro" @update:model-value="cargar">
          <template #prepend><q-icon name="filter_list" /></template>
        </q-select>

        <q-btn color="primary" icon="person_add" label="Nuevo aprendiz" unelevated no-caps class="btn-nuevo"
          @click="abrir()" />
      </div>
    </div>

    <!-- Tabla -->
    <q-table class="tabla" flat v-model:pagination="paginacion" :rows="aprendices" :columns="columnas"
      row-key="_id" :loading="cargando" :filter="buscar" :filter-method="filtrar"
      no-data-label="No hay aprendices para mostrar" no-results-label="Sin resultados para tu búsqueda"
      rows-per-page-label="Filas por página" :rows-per-page-options="[5, 10, 25, 50]">
      <template #body-cell-nombre="{ row }">
        <q-td>
          <div class="persona">
            <div class="avatar">{{ iniciales(row.nombre) }}</div>
            <div class="persona-datos">
              <div class="persona-nombre">{{ row.nombre }}</div>
              <div class="persona-correo">{{ row.email }}</div>
            </div>
          </div>
        </q-td>
      </template>

      <template #body-cell-curso="{ row }">
        <q-td>
          <span class="curso" :class="{ 'sin-curso': !row.curso }">{{ row.curso?.nombre || "Sin curso" }}</span>
        </q-td>
      </template>

      <template #body-cell-status="{ row }">
        <q-td class="text-center">
          <span class="estado" :class="row.status === 0 ? 'estado-activo' : 'estado-inactivo'">
            {{ row.status === 0 ? "Activo" : "Inactivo" }}
          </span>
        </q-td>
      </template>

      <template #body-cell-acciones="{ row }">
        <q-td class="text-right">
          <q-btn flat round dense icon="edit" color="grey-7" @click="abrir(row)">
            <q-tooltip>Editar</q-tooltip>
          </q-btn>
          <q-btn flat round dense size="lg" :icon="row.status === 0 ? 'toggle_on' : 'toggle_off'"
            :color="row.status === 0 ? 'positive' : 'grey-5'" @click="cambiarEstado(row)">
            <q-tooltip>{{ row.status === 0 ? "Desactivar" : "Activar" }}</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
  </div>

  <!-- Diálogo -->
  <q-dialog v-model="dialogo" transition-show="scale" transition-hide="scale">
    <q-card class="dialogo">
      <div class="dialogo-cabeza">
        <div class="dialogo-icono"><q-icon :name="editandoId ? 'edit' : 'person_add'" size="22px" /></div>
        <div class="dialogo-titulo">{{ editandoId ? "Editar aprendiz" : "Nuevo aprendiz" }}</div>
        <q-btn flat round dense icon="close" color="grey-7" v-close-popup />
      </div>

      <q-form @submit.prevent="guardar" novalidate>
        <q-card-section class="campos">
          <q-input v-model="form.documento" label="Documento" outlined lazy-rules="ondemand"
            :rules="[(v) => !!v || 'El documento es obligatorio']">
            <template #prepend><q-icon name="badge" /></template>
          </q-input>
          <q-input v-model="form.nombre" label="Nombre completo" outlined lazy-rules="ondemand"
            :rules="[(v) => !!v || 'El nombre es obligatorio']">
            <template #prepend><q-icon name="person_outline" /></template>
          </q-input>
          <q-input v-model="form.email" type="email" label="Correo electrónico" outlined lazy-rules="ondemand"
            :rules="[(v) => !!v || 'El correo es obligatorio', (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Escribe un correo válido (ej: nombre@correo.com)']">
            <template #prepend><q-icon name="mail_outline" /></template>
          </q-input>
          <q-select v-model="form.curso" :options="opcionesCurso" emit-value map-options label="Curso" outlined
            lazy-rules="ondemand" :rules="[(v) => !!v || 'Selecciona un curso']">
            <template #prepend><q-icon name="menu_book" /></template>
          </q-select>
        </q-card-section>

        <q-card-actions align="right" class="dialogo-acciones">
          <q-btn flat no-caps label="Cancelar" color="grey-8" v-close-popup />
          <q-btn type="submit" color="primary" unelevated no-caps label="Guardar aprendiz" class="btn-guardar" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
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
.encabezado {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;
  margin-bottom: 20px;
}
.encabezado h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.02em; color: #fff; }
.contador { margin-top: 2px; font-size: 14px; color: rgba(255, 255, 255, 0.75); }
.herramientas { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
.buscador { width: 250px; }
.filtro { width: 250px; }
.btn-nuevo { height: 40px; border-radius: 10px; font-weight: 600; box-shadow: 0 6px 14px rgba(27, 127, 92, 0.25); }

/* ---------- Tabla ---------- */
.tabla {
  background: rgba(255, 255, 255, 0.97); border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 16px; overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.32), 0 4px 12px rgba(0, 0, 0, 0.15);
}
.tabla :deep(thead tr) { background: #f8fafb; }
.tabla :deep(thead th) {
  height: 48px; font-size: 12px; font-weight: 700; letter-spacing: 0.05em;
  text-transform: uppercase; color: #6b7a86;
}
.tabla :deep(tbody td) { height: 64px; font-size: 14px; color: #1f2933; }
.tabla :deep(tbody tr:hover) { background: #f6faf8; }
.tabla :deep(.q-table__bottom) { border-top: 1px solid #e4e9ee; font-size: 13px; }

/* Persona: avatar + nombre + correo */
.persona { display: flex; align-items: center; gap: 12px; }
.avatar {
  width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: #e6f4ee; color: #1b7f5c; font-weight: 700; font-size: 13px;
}
.persona-datos { min-width: 0; }
.persona-nombre { font-weight: 600; text-transform: capitalize; color: #12202a; }
.persona-correo { font-size: 12.5px; color: #6b7a86; }

.curso { text-transform: capitalize; }
.sin-curso { color: #9aa7b2; font-style: italic; }

/* Estado */
.estado {
  display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 999px;
  font-size: 12px; font-weight: 600;
}
.estado::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.estado-activo { background: #e6f4ee; color: #14654a; }
.estado-inactivo { background: #eef1f4; color: #6b7a86; }

/* ---------- Diálogo ---------- */
.dialogo { width: 460px; max-width: 94vw; border-radius: 18px; }
.dialogo-cabeza { display: flex; align-items: center; gap: 12px; padding: 20px 20px 4px; }
.dialogo-icono {
  width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
  background: #e6f4ee; color: #1b7f5c;
}
.dialogo-titulo { flex: 1; font-size: 19px; font-weight: 700; color: #12202a; }
.campos { display: flex; flex-direction: column; gap: 6px; padding-top: 16px; }
.dialogo-acciones { padding: 8px 20px 20px; gap: 8px; }
.btn-guardar { border-radius: 10px; padding: 0 20px; height: 42px; font-weight: 600; }

@media (max-width: 700px) {
  .buscador, .filtro { width: 100%; }
  .herramientas { width: 100%; }
}
</style>