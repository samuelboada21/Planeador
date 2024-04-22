import { Router } from 'express';
import Usuario from '../models/Usuario.js';

// Middleware de verificación de token
import extractToken from '../middlewares/extractToken.js';
import verifyJWT from '../middlewares/verifyJWT.js';
import isAdmin from '../middlewares/isAdmin.js';
import { validateUserData } from '../schemas/userSchema.js'

// Importamos las funciones del controlador
import userController from '../controllers/userController.js';
import limiter from '../middlewares/rateLimit.js';

// Inicializamos el router
const router = Router();

// Routes

// @desc Endpoint encargado de la obtención del perfil de cada usuario
// @route GET /api/user/profile
// @access solo Usuarios
router.get('/profile', [ extractToken, verifyJWT ], userController.getProfile);


// @desc Endpoint encargado de la obtención de todos los docentes activos
// @route GET /api/user/teachers
// @access solo Admin
router.get('/teachers', [ extractToken, verifyJWT, isAdmin, validateUserData ], userController.getTeachers);


// @desc Endpoint encargado de la obtención de un solo docente por su id
// @route GET /api/user/teacher/:id
// @access Docente
router.get('/teacher/:id', [ extractToken, verifyJWT, isAdmin, validateUserData ], userController.getTeacherById);


// @desc Endpoint encargado de la actualización de los datos de contacto de un docente por el mismo a partir de su id
// @route PUT /api/user/teacher/update
// @access Docente
router.put('/teacher/update', [ limiter, extractToken, verifyJWT, validateUserData ], userController.updateTeacherData);


// @desc Endpoint encargado de la actualización de datos de un docente por parte del director
// @route PUT /api/user/teacher/update/:id
// @access solo Admin
router.put('/teacher/update/:id', [ extractToken, verifyJWT, isAdmin, validateUserData ], userController.updateTeacherDataDir);


// @desc Endpoint encargado de la obtención de todos los directores registrados (incluidos no activos)
// @route GET /api/user/admin
// @access solo Admin
router.get('/admin', [extractToken, verifyJWT, isAdmin], userController.getDirectors);


// @desc Endpoint encargado de la obtención de un unico director por su id
// @route GET /api/user/admin/:id
// @access solo Admin
router.get('/admin/:id', [extractToken, verifyJWT, isAdmin, validateUserData], userController.getDirectorById);


// @desc Endpoint encargado de la actualización de los datos del director en función
// @route PUT /api/user/admin/update
// @access solo Admin
router.put('/admin/update', [limiter, extractToken, verifyJWT, isAdmin, validateUserData], userController.updateDirector);


// @desc Endpoint encargado de la actualización de la contraseña de un usuario
// @route PUT /api/user/updatePassword
// @access solo Usuarios
router.put('/updatePassword', [limiter, extractToken, verifyJWT], userController.updatePassword);


// @desc Endpoint encargado de la desvinculación de un estudiante de la plataforma
// @route DELETE /api/user/deleteTeacher/:id
// @access solo Admin
router.delete('/deleteTeacher/:id', [extractToken, verifyJWT, isAdmin], userController.deleteTeacher);


// Importamos el router
export default router;