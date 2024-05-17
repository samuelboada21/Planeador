import {Router} from 'express';
// Importamos las funciones del controlador
import raCursoController from '../controllers/raCursoController.js';
// Importamos los middlewares de autenticación
import extractToken from '../middlewares/extractToken.js';
import authJWT from '../middlewares/verifyJWT.js';
import isAdmin from '../middlewares/isAdmin.js';
import {validateRaCursoData} from '../schemas/raCursoSchema.js'

//Importamos para validar excels
import fileupload from 'express-fileupload';
import fileSizeLimiter from '../middlewares/fileSizeLimiter.js';
import filePayloadExist from '../middlewares/filePayloadExist.js';
import fileExcelLimiter from '../middlewares/fileExcelLimiter.js';

// Inicializamos el router
const router = Router();
// Rutas

// @desc Endpoint encargado de la obtención de todos los ra curso
// @route GET /api/raCurso
// @access solo Admin
router.get('/', [extractToken, authJWT, isAdmin, validateRaCursoData], raCursoController.getRaCursos);//probado

// @desc Endpoint encargado de la obtención de un ra curso por id
// @route GET /api/raCurso/:id
// @access solo Admin
router.get('/:id', [extractToken, authJWT, isAdmin, validateRaCursoData], raCursoController.getRaCursoById);//probado

// @desc Endpoint encargado de la creación de un ra curso
// @route POST /api/raCurso/create
// @access solo Admin
router.post('/create', [extractToken, authJWT, isAdmin, validateRaCursoData], raCursoController.createRaCurso);//probado

// @desc Endpoint encargado de la carga de excel con el listado de ra cursos
// @route POST /api/raCurso/createRaCursos
// @access solo Admin
router.post('/createRaCursos', [extractToken, authJWT, isAdmin, fileupload(), filePayloadExist, fileExcelLimiter('.xlsx'), fileSizeLimiter], raCursoController.createRaCursos);//probado

// @desc Endpoint encargado de la actualización de un ra curso
// @route PUT /api/raCurso/update/:id
// @access solo Admin
router.put('/update/:id', [extractToken, authJWT, isAdmin, validateRaCursoData], raCursoController
.updateRaCurso);//probado

// @desc Endpoint encargado de la eliminacion de un ra curso
// @route DELETE /api/raCurso/delete/:id
// @access solo Admin
router.delete('/delete/:id', [extractToken, authJWT, isAdmin], raCursoController.deleteRaCurso);//probado

// Exportamos el router
export default router;