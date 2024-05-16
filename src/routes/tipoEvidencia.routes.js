import {Router} from 'express';
// Importamos las funciones del controlador
import tipoEvidenciaController from '../controllers/tipoEvidenciaController.js';
// Importamos los middlewares de autenticación
import extractToken from '../middlewares/extractToken.js';
import authJWT from '../middlewares/verifyJWT.js';
import isAdmin from '../middlewares/isAdmin.js';
import {validateTipoEvidenciaData} from '../schemas/tipoEvidenciaSchema.js'

// Inicializamos el router
const router = Router();
// Rutas

// @desc Endpoint encargado de la obtención de todos los tipo de evidencias
// @route GET /api/tipoEvidencia
// @access solo Admin
router.get('/', [extractToken, authJWT, isAdmin, validateTipoEvidenciaData], tipoEvidenciaController.getTipoEvidencias);//probado

// @desc Endpoint encargado de la obtención de un tipo de evidencia por id
// @route GET /api/tipoEvidencia/:id
// @access solo Admin
router.get('/:id', [extractToken, authJWT, isAdmin, validateTipoEvidenciaData], tipoEvidenciaController.getTipoEvidenciaById);//probado

// @desc Endpoint encargado de la creación de un tipo de evidencia
// @route POST /api/tipoEvidencia/create
// @access solo Admin
router.post('/create', [extractToken, authJWT, isAdmin, validateTipoEvidenciaData], tipoEvidenciaController.createTipoEvidencia);//probado

// @desc Endpoint encargado de la actualización de un tipo de evidencia
// @route PUT /api/tipoEvidencia/update/:id
// @access solo Admin
router.put('/update/:id', [extractToken, authJWT, isAdmin, validateTipoEvidenciaData], tipoEvidenciaController
.updateTipoEvidencia);//probado

// @desc Endpoint encargado de la eliminacion de un ra curso
// @route DELETE /api/tipoEvidencia/delete/:id
// @access solo Admin
router.delete('/delete/:id', [extractToken, authJWT, isAdmin], tipoEvidenciaController.deleteTipoEvidencia);//probado

// Exportamos el router
export default router;