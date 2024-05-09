import express from "express";
import logger from "./middlewares/logger.js";
import errorHandler from './middlewares/errorHandler.js';
import sequelize from "./database/db.js";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import corsOptions from './util/corsOptions.js';
import generateRole from "./util/generateRole.js";
import createAdminUser from './util/createAdminUser.js';
import pino_http from 'pino-http';
import pino from 'pino';
import helmet from 'helmet';
import bodyParser from 'body-parser';

//Importamos las tablas a crear
import "./database/associations.js";

//Importamos las rutas de la API
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import categoriaRoutes from './routes/categoria.routes.js';
import competenciaRoutes from './routes/competencia.routes.js';
import resultadoRoutes from './routes/resultado.routes.js';
import materiaRoutes from './routes/materia.routes.js';
import unidadRoutes from './routes/unidad.routes.js';

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

//Inicializamos el contexto principal
const app = express();
//Puerto de escucha del servidor
const PORT = process.env.PORT || 3000;

//Middlewares
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json({ limit: '15mb' }));
app.use(cookieParser());
app.use(
  pino_http({
    logger,

    // Serializers
    serializers: {
      err: pino.stdSerializers.err,
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
    },

    wrapSerializers: true,

    // Custom logger level
    customLogLevel: function (req, res, err) {
      if (res.statusCode === 404) return "warn";
      else if (res.statusCode >= 300) return "silent";
      return "info";
    },

    // Mensaje de exito
    customSuccessMessage: function (req, res) {
      if (res.statusCode === 404) {
        return "Recurso no encontrado";
      }
      return `${req.method} operacion completada`;
    },

    // Sobrescritura de las llaves del objeto log
    customAttributeKeys: {
      req: "request",
      res: "response",
      err: "error",
      responseTime: "timeTaken",
    },
  })
);
//Rutas
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/categoria', categoriaRoutes);
app.use('/api/competencia', competenciaRoutes);
app.use('/api/ra',resultadoRoutes);
app.use('/api/materia', materiaRoutes);
app.use('/api/unidad', unidadRoutes);

// En caso de acceder a una ruta no especificada
app.all('*', (req, res) => {

    res.status(404);

    if(req.accepts('json')){
        res.json({message: "404 Not Found"});
    }else{
        res.type('txt').send('404 Not Found');
    }

});

// Middleware de manejo de errores
app.use(errorHandler);

//Inicializamos el servidor
const main = async () => {
  try {
    //sicronizamos las tablas
    await sequelize.sync();
    //generamos los roles automaticamente
    await generateRole();
    // creamos el usuario administrador
    await createAdminUser();

    const server = app.listen(PORT, () => {
        logger.info({ status: 'Bienvenido, servidor actualmente en funcionamiento',  }, `App is running on http://localhost:${PORT}`);
    });
     // Configuramos los tiempos de espera del servidor
     server.timeout = 30000;
     server.keepAliveTimeout = 10000;
     server.headersTimeout = 20000;
     server.requestTimeout = 15000;
  } catch (error) {
    logger.error(error, `Error al intentar sincronizar con la BD`);
  }
};

main();
