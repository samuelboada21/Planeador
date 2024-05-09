import {Router} from 'express';
// Importamos las funciones del controlador
import unidadController from '../controllers/unidadController.js';
// Importamos los middlewares de autenticación
import extractToken from '../middlewares/extractToken.js';
import authJWT from '../middlewares/verifyJWT.js';
import isAdmin from '../middlewares/isAdmin.js';
import {validateUnidadData} from '../schemas/unidadSchema.js'

//Importamos para validar excels
import fileupload from 'express-fileupload';
import fileSizeLimiter from '../middlewares/fileSizeLimiter.js';
import filePayloadExist from '../middlewares/filePayloadExist.js';
import fileExcelLimiter from '../middlewares/fileExcelLimiter.js';

// Inicializamos el router
const router = Router();
// Rutas

// @desc Endpoint encargado de la obtención de todas las materias activas
// @route GET /api/unidad
// @access solo Admin
router.get('/', [extractToken, authJWT, isAdmin, validateUnidadData], unidadController.getUnidades);//probado

// @desc Endpoint encargado de la obtención de una materia por id
// @route GET /api/unidad/:id
// @access solo Admin
router.get('/:id', [extractToken, authJWT, isAdmin, validateUnidadData], unidadController.getUnidadById);//probado

// @desc Endpoint encargado de la creación de una materia
// @route POST /api/unidad/create
// @access solo Admin
router.post('/create', [extractToken, authJWT, isAdmin, validateUnidadData], unidadController.createUnidad);//probado

// @desc Endpoint encargado de la carga de excel con el lsitado de materia
// @route PUT /api/unidad/createUnidades
// @access solo Admin
router.post('/createUnidades', [extractToken, authJWT, isAdmin, fileupload(), filePayloadExist, fileExcelLimiter('.xlsx'), fileSizeLimiter], unidadController.createUnidades);//probado

// @desc Endpoint encargado de la actualización de una categoria
// @route PUT /api/unidad/update/:id
// @access solo Admin
router.put('/update/:id', [extractToken, authJWT, isAdmin, validateUnidadData], unidadController
.updateUnidad);//probado

// @desc Endpoint encargado de la desvinculación de una unidad tematica de su materia
// @route PUT /api/unidad/unlinkSubtema/:id
// @access solo Admin
router.put('/unlinkSubtema/:id', [extractToken, authJWT, isAdmin], unidadController.unlinkSubtema);//

// @desc Endpoint encargado de la eliminacion de una materia
// @route PUT /api/unidad/delete/:id
// @access solo Admin
router.delete('/delete/:id', [extractToken, authJWT, isAdmin], unidadController.deleteUnidad);//probado

// Exportamos el router
export default router;