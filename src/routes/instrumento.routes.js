import {Router} from 'express';
// Importamos las funciones del controlador
import instrumentoController from '../controllers/instrumentoController.js';
// Importamos los middlewares de autenticación
import extractToken from '../middlewares/extractToken.js';
import authJWT from '../middlewares/verifyJWT.js';
import isAdmin from '../middlewares/isAdmin.js';
import {validateInstrumentoData} from '../schemas/instrumentoSchema.js'

//Importamos para validar excels
import fileupload from 'express-fileupload';
import fileSizeLimiter from '../middlewares/fileSizeLimiter.js';
import filePayloadExist from '../middlewares/filePayloadExist.js';
import fileExcelLimiter from '../middlewares/fileExcelLimiter.js';

// Inicializamos el router
const router = Router();
// Rutas

// @desc Endpoint encargado de la obtención de todos los instrumentos
// @route GET /api/instrumento
// @access solo Admin
router.get('/', [extractToken, authJWT, isAdmin, validateInstrumentoData], instrumentoController.getInstrumentos);//probado

// @desc Endpoint encargado de la obtención de un instrumento por id
// @route GET /api/instrumento/:id
// @access solo Admin
router.get('/:id', [extractToken, authJWT, isAdmin, validateInstrumentoData], instrumentoController.getInstrumentoById);//probado

// @desc Endpoint encargado de la creación de un instrumento
// @route POST /api/instrumento/create
// @access solo Admin
router.post('/create', [extractToken, authJWT, isAdmin, validateInstrumentoData], instrumentoController.createInstrumento);//probado

// @desc Endpoint encargado de la carga de excel con el listado de instrumentos
// @route POST /api/instrumento/createInstrumentos
// @access solo Admin
router.post('/createInstrumentos', [extractToken, authJWT, isAdmin, fileupload(), filePayloadExist, fileExcelLimiter('.xlsx'), fileSizeLimiter], instrumentoController.createInstrumentos);//probado

// @desc Endpoint encargado de la actualización de un instrumento
// @route PUT /api/instrumento/update/:id
// @access solo Admin
router.put('/update/:id', [extractToken, authJWT, isAdmin, validateInstrumentoData], instrumentoController
.updateInstrumento);//probado

// @desc Endpoint encargado de la eliminacion de un instrumento
// @route DELETE /api/instrumento/delete/:id
// @access solo Admin
router.delete('/delete/:id', [extractToken, authJWT, isAdmin], instrumentoController.deleteInstrumento);//probado

// Exportamos el router
export default router;