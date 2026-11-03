/**
 * Conexion a MongoDB usando la variable de entorno MONGO_URL.
 * - Si falla, explica la causa mas probable y reintenta cada 5 segundos.
 * - Si la URL es "mongodb+srv://" (Atlas) y el DNS de tu red rechaza la consulta
 *   SRV, reintenta automaticamente con DNS publico (Google y Cloudflare).
 */
import dns from "dns";
import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const OPCIONES = { serverSelectionTimeoutMS: 10000 };

/**
 * Conecta una sola vez (sin reintentos). La usan tambien los scripts (seed).
 * @throws {Error} si no logra conectar
 */
const conectar = async () => {
  const url = process.env.MONGO_URL;
  if (!url) {
    throw new Error(
      "Falta MONGO_URL. Crea el archivo .env (copia .env.example) dentro de la carpeta del backend."
    );
  }

  try {
    await mongoose.connect(url, OPCIONES);
  } catch (e) {
    const falloDns = /querySrv|ENOTFOUND|ETIMEOUT|EREFUSED/i.test(e.message);
    if (url.startsWith("mongodb+srv") && falloDns) {
      console.log("El DNS de tu red rechazo la consulta de Atlas. Probando con DNS publico...");
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
      await mongoose.connect(url, OPCIONES);
    } else {
      throw e;
    }
  }
};

/**
 * Traduce el error tecnico a una causa probable y que hacer.
 */
const explicarError = (e) => {
  const m = String(e?.message || e);
  if (/Falta MONGO_URL|must be a string|undefined/i.test(m))
    return "No se encontro MONGO_URL. Crea el archivo .env en la carpeta del backend (copia .env.example).";
  if (/bad auth|Authentication failed/i.test(m))
    return "Usuario o contrasena de MongoDB incorrectos en MONGO_URL. Si la clave tiene @ # / : ? escribela codificada (ej: @ = %40).";
  if (/127\.0\.0\.1|localhost/i.test(m) && /ECONNREFUSED/i.test(m))
    return "MongoDB local no esta iniciado. Inicia el servicio de MongoDB o usa una URL de MongoDB Atlas.";
  if (/querySrv|ENOTFOUND|ETIMEOUT|EREFUSED/i.test(m))
    return "Tu red bloquea la consulta DNS de Atlas. Prueba con otra red (datos del celular) o usa la cadena de conexion estandar mongodb:// de Atlas.";
  if (/Could not connect to any servers|whitelist|ReplicaSetNoPrimary|Server selection/i.test(m))
    return "Atlas no te deja entrar: agrega tu IP en Atlas > Network Access (para pruebas puedes usar 0.0.0.0/0) y confirma que el cluster no este pausado.";
  return "Revisa MONGO_URL en el archivo .env.";
};

const dbConnection = async () => {
  try {
    await conectar();
    console.log("Conectado a la base de datos");
  } catch (e) {
    console.log("Error conectando a la base de datos: " + e.message);
    console.log("Posible solucion: " + explicarError(e));
    console.log("Reintentando en 5s...");
    setTimeout(dbConnection, 5000);
  }
};

export { conectar, explicarError };
export default dbConnection;
