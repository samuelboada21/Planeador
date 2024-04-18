import express from 'express';
import dotenv from 'dotenv';
import sequelize from './database/db.js';
import generateRole from './util/generateRole.js';

//Importamos las tablas a crear
import './database/associations.js';

//Importamos las rutas de la API

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

//Inicializamos el contexto principal
const app = express();
//Puerto de escucha del servidor
const PORT = process.env.PORT || 3000;

//Middlewares

//Rutas

//Inicializamos el servidor
const main = async () =>{
    try {
        //sicronizamos las tablas
        await sequelize.sync();
        //generamos los roles automaticamente
        await generateRole();
        //creamos el usuario administrador

        const server = app.listen(PORT, () => {
            console.log('Server listening on port', PORT);
        });
    }catch (error) {
        console.log('Error al sincronizar la base de datos', error);
    }
}

main();

