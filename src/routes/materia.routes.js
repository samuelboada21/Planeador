import {Router} from 'express';
// Importamos las funciones del controlador
import materiaController from '../controllers/materiaController.js';
// Importamos los middlewares de autenticación
import extractToken from '../middlewares/extractToken.js';
import authJWT from '../middlewares/verifyJWT.js';
import isAdmin from '../middlewares/isAdmin.js';
import {validateMateriaData} from '../schemas/materiaSchema.js'

//Importamos para validar excels
import fileupload from 'express-fileupload';
import fileSizeLimiter from '../middlewares/fileSizeLimiter.js';
import filePayloadExist from '../middlewares/filePayloadExist.js';
import fileExcelLimiter from '../middlewares/fileExcelLimiter.js';

// Inicializamos el router
const router = Router();
// Rutas

// @desc Endpoint encargado de la obtención de todas las materias activas
// @route GET /api/materia
// @access solo Admin
router.get('/', [extractToken, authJWT, isAdmin, validateMateriaData], materiaController.getMaterias);//probado

// @desc Endpoint encargado de la obtención de una materia por id
// @route GET /api/materia/:id
// @access solo Admin
router.get('/:id', [extractToken, authJWT, isAdmin, validateMateriaData], materiaController.getMateriaById);//probado

// @desc Endpoint encargado de la creación de una materia
// @route POST /api/materia/create
// @access solo Admin
router.post('/create', [extractToken, authJWT, isAdmin, validateMateriaData], materiaController.createMateria);//probado

// @desc Endpoint encargado de la carga de excel con el lsitado de materia
// @route PUT /api/materia/createMaterias
// @access solo Admin
router.post('/createMaterias', [extractToken, authJWT, isAdmin, fileupload(), filePayloadExist, fileExcelLimiter('.xlsx'), fileSizeLimiter], materiaController.createMaterias);//probado

// @desc Endpoint encargado de la actualización de una categoria
// @route PUT /api/materia/update/:id
// @access solo Admin
router.put('/update/:id', [extractToken, authJWT, isAdmin, validateMateriaData], materiaController.updateMateria);//probado

// @desc Endpoint encargado de la desvinculación de una unidad tematica de su materia
// @route PUT /api/materia/unlinkUnidad/:id
// @access solo Admin
router.put('/unlinkUnidad/:id', [extractToken, authJWT, isAdmin], materiaController.unlinkUnidades);//

// @desc Endpoint encargado de la eliminacion de una materia
// @route PUT /api/materia/delete/:id
// @access solo Admin
router.delete('/delete/:id', [extractToken, authJWT, isAdmin], materiaController.deleteMateria);//

// Exportamos el router
export default router;