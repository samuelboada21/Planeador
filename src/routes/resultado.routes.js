import {Router} from 'express';
// Importamos las funciones del controlador
import raController from '../controllers/raController.js';
// Importamos los middlewares de autenticación
import extractToken from '../middlewares/extractToken.js';
import authJWT from '../middlewares/verifyJWT.js';
import isAdmin from '../middlewares/isAdmin.js';
import { validateResultData } from '../schemas/resultSchema.js';

// Inicializamos el router
const router = Router();
// Rutas

// @desc Endpoint encargado de la obtención de todos los resultados de aprendizaje activos
// @route GET /api/ra
// @access solo Admin
router.get('/', [extractToken, authJWT, isAdmin, validateResultData], raController.getResultados);//probado

// @desc Endpoint encargado de la obtención de un ra por Id
// @route GET /api/ra/:id
// @access solo Admin
router.get('/:id', [extractToken, authJWT, isAdmin, validateResultData], raController.getResultadoById);//probado

// @desc Endpoint encargado de la creación de un ra
// @route POST /api/ra/create
// @access solo Admin
router.post('/create', [extractToken, authJWT, isAdmin, validateResultData], raController.createResultado);//probado

// @desc Endpoint encargado de la actualización de un ra dado su id 
// @route PUT /api/ra/update/:id
// @access solo Admin
router.put('/update/:id', [extractToken, authJWT, isAdmin, validateResultData], raController.updateResultado);//probado

// @desc Endpoint encargado de la eliminacion de un resultado de aprendizaje
// @route PUT /api/ra/deleteRa/:id
// @access solo Admin
router.delete('/deleteRa/:id', [extractToken, authJWT, isAdmin], raController.deleteResultado);//probado

// Exportamos el router
export default router;