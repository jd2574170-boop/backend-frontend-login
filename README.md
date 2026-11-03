# Cursos y Aprendices

Backend (Node + Express + MongoDB) y frontend (Vue 3 + Quasar + Pinia).

```
backend prueba/    API REST      -> http://localhost:4500
frontend-prueba/   Aplicacion    -> http://localhost:5173
```

## Como ejecutarlo (en este orden, con DOS terminales)

### Terminal 1 - Backend
```bash
cd "backend prueba"
npm install
npm run seed        # SOLO la primera vez: crea cursos, aprendices y el usuario admin
npm run dev
```
Debe aparecer:
```
Servidor en http://localhost:4500
Conectado a la base de datos
```

### Terminal 2 - Frontend
```bash
cd frontend-prueba
npm install
npm run dev
```
Abre **http://localhost:5173** e inicia sesion con:

- correo: `admin@sena.edu.co`
- contraseña: `123456`

> Usa siempre el puerto **5173**. El puerto 4500 solo sirve una version compilada vieja
> (carpeta `backend prueba/public`) hasta que hagas `npm run build` en el frontend.

## Si algo falla

| Error | Causa | Solucion |
|---|---|---|
| `Cannot find module 'app.js'` | falta `app.js` | ya viene incluido en este proyecto |
| `Falta MONGO_URL` / `must be a string` | no existe el archivo `.env` | copia `.env.example` a `.env` en `backend prueba/` |
| `ECONNREFUSED 127.0.0.1:27017` | MongoDB local apagado | inicia MongoDB o usa la URL de Atlas |
| `Could not connect to any servers` | Atlas bloquea tu IP | Atlas > Network Access > agrega tu IP (o `0.0.0.0/0` solo para pruebas) |
| `bad auth` | usuario/clave de Atlas incorrectos | revisa `MONGO_URL` (si la clave tiene `@ # /` codificala: `@` = `%40`) |
| `querySrv ECONNREFUSED` | tu red bloquea el DNS de Atlas | prueba con otra red (datos del celular) |
| "No hay conexion con el servidor" en el login | el backend no esta corriendo | revisa la Terminal 1 |
| Login dice "Usuario o contraseña incorrectos" | no se ejecuto el seed | `npm run seed` en el backend |

Despues de cambiar un `.env`, reinicia el servidor (Ctrl + C y `npm run dev`).

## Subir a GitHub
Los archivos `.env` NO se suben (estan en `.gitignore`: tienen claves). Sube `.env.example`.
