import dotenv from 'dotenv';

// Carga las variables de entorno desde el archivo .env
dotenv.config();

// Lee y procesa la variable ALLOWED_ORIGINS desde el archivo .env
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || '';
const allowedOrigins = allowedOriginsEnv.split(',').map(origin => origin.trim());

console.log(allowedOrigins); // Esto imprimirá la lista de orígenes permitidos para depuración

export { allowedOrigins };

//configuración antigua
//// Definimos desde que origenes se podrá acceder a nuestro Backend
// export const allowedOrigins = [
//     'http://localhost:5173',
//     'http://localhost:3000',
//     'https://samuel.github.io',
// ];