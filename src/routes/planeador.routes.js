import {Router} from 'express';
// Importamos las funciones del controlador
import planeadorController from '../controllers/planeadorController.js';
// Importamos los middlewares de autenticación
import extractToken from '../middlewares/extractToken.js';
import authJWT from '../middlewares/verifyJWT.js';
import isAdmin from '../middlewares/isAdmin.js';
import {validatePlaneadorData} from '../schemas/planeadorSchema.js'

// Inicializamos el router
const router = Router();
// Rutas

// @desc Endpoint encargado de la obtención de todas los planeador
// @route GET /api/planeador
// @access solo Admin
router.get('/', [extractToken, authJWT, isAdmin, validatePlaneadorData], planeadorController.getPlaneadores);//

// @desc Endpoint encargado de la obtención de un planeador por id
// @route GET /api/planeador/:id
// @access solo Admin
router.get('/:id', [extractToken, authJWT, isAdmin, validatePlaneadorData], planeadorController.getPlaneadorById);//

// @desc Endpoint encargado de la creación de un planeador
// @route POST /api/planeador/create
// @access solo Admin
router.post('/create', [extractToken, authJWT, isAdmin, validatePlaneadorData], planeadorController.createPlaneador);//

// @desc Endpoint encargado de la actualización de un planeador
// @route PUT /api/planeador/update/:id
// @access solo Admin
router.put('/update/:id', [extractToken, authJWT, isAdmin, validatePlaneadorData], planeadorController.updatePlaneador);//

// @desc Endpoint encargado de la eliminacion de un planeador con sus detalles de planeador
// @route DELETE /api/planeador/delete/:id
// @access solo Admin
router.delete('/delete/:id', [extractToken, authJWT, isAdmin], planeadorController.deletePlaneador);//

// Exportamos el router
export default router;