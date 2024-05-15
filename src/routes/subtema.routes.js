import {Router} from 'express';
// Importamos las funciones del controlador
import subtemaController from '../controllers/subtemaController.js';
// Importamos los middlewares de autenticación
import extractToken from '../middlewares/extractToken.js';
import authJWT from '../middlewares/verifyJWT.js';
import isAdmin from '../middlewares/isAdmin.js';
import {validateSubtemaData} from '../schemas/subtemaSchema.js'

//Importamos para validar excels
import fileupload from 'express-fileupload';
import fileSizeLimiter from '../middlewares/fileSizeLimiter.js';
import filePayloadExist from '../middlewares/filePayloadExist.js';
import fileExcelLimiter from '../middlewares/fileExcelLimiter.js';

// Inicializamos el router
const router = Router();
// Rutas

// @desc Endpoint encargado de la obtención de todas los subtemas
// @route GET /api/subtema
// @access solo Admin
router.get('/', [extractToken, authJWT, isAdmin, validateSubtemaData], subtemaController.getSubtemas);//probado

// @desc Endpoint encargado de la obtención de un subtema por id
// @route GET /api/subtema/:id
// @access solo Admin
router.get('/:id', [extractToken, authJWT, isAdmin, validateSubtemaData], subtemaController.getSubtemaById);//probado

// @desc Endpoint encargado de la creación de un subtema
// @route POST /api/subtema/create
// @access solo Admin
router.post('/create', [extractToken, authJWT, isAdmin, validateSubtemaData], subtemaController.createSubtema);//probado

// @desc Endpoint encargado de la creación de varios subtemas para una misma unidad por excel
// @route POST /api/subtema/createSubtemas
// @access solo Admin
router.post('/createSubtemas/:id', [extractToken, authJWT, isAdmin, fileupload(), filePayloadExist, fileExcelLimiter('.xlsx'), fileSizeLimiter], subtemaController.createSubtemas);//probado

// @desc Endpoint encargado de la actualización de un subtema
// @route PUT /api/subtema/update/:id
// @access solo Admin
router.put('/update/:id', [extractToken, authJWT, isAdmin, validateSubtemaData], subtemaController
.updateSubtema);//probado

// @desc Endpoint encargado de la eliminacion de un subtema
// @route PUT /api/subtema/delete/:id
// @access solo Admin
router.delete('/delete/:id', [extractToken, authJWT, isAdmin], subtemaController.deleteSubtema);//probado

// Exportamos el router
export default router;