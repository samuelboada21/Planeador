import {Router} from 'express';
// Importamos las funciones del controlador
import planeadorController from '../controllers/planeadorController.js';
import detallesController from '../controllers/detallesPlaneadorController.js';
// Importamos los middlewares de autenticación
import extractToken from '../middlewares/extractToken.js';
import authJWT from '../middlewares/verifyJWT.js';
import isAdmin from '../middlewares/isAdmin.js';
import {validatePlaneadorData} from '../schemas/planeadorSchema.js'
import {validateDetallesData} from '../schemas/detallesPlaneadorSchema.js';
 
// Inicializamos el router
const router = Router();
// Rutas

//-------------------------------RUTAS DEL PLANEADOR GENERAL-------------------------------//
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

//-------------------------------RUTAS DE DETALLES PLANEADOR-------------------------------//
// @desc Endpoint encargado de la obtención de todas las filas del planeador
// @route GET /api/planeador/filasPlaneador/:id
// @access solo Admin
router.get('/filasPlaneador/:id', [extractToken, authJWT, isAdmin, validateDetallesData], detallesController.getDetallesByPlaneador);//probado

// @desc Endpoint encargado de la obtención de una fila del planeador
// @route GET /api/planeador/fila/:id
// @access solo Admin
router.get('/fila/:id', [extractToken, authJWT, isAdmin, validateDetallesData], detallesController.getDetallesById);//probado

// @desc Endpoint encargado de la obtención de una fila del planeador
// @route POST /api/planeador/fila/create
// @access solo Admin
router.post('/fila/create', [extractToken, authJWT, isAdmin, validateDetallesData], detallesController.createDetallesPlaneador);//probado

// @desc Endpoint encargado de la actualización de una fila del planeador
// @route PUT /api/planeador/fila/update/id
// @access solo Admin
router.put('/fila/update/:id', [extractToken, authJWT, isAdmin, validateDetallesData], detallesController.updateDetallesPlaneador);//probado - pero si un tipo evidencia no existe, se debe crear primero para poder crear las relaciones correctamente en detallesPlaneador - tipoEvidencia.

// @desc Endpoint encargado de la eliminación de una fila del planeador
// @route DELETE /api/planeador/fila/delete/id
// @access solo Admin
router.delete('/fila/delete/:id', [extractToken, authJWT, isAdmin], detallesController.deletePlaneador);//probado

// Exportamos el router
export default router;