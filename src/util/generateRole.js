import Rol from '../models/Rol.js';
import logger from '../middlewares/logger.js';

//función para generar los roles automaticamente
const generateRole = async () => {

    try {
// Verificar si los roles ya existen en la BD
        const result = await Rol.findAndCountAll();

        if (result.count === 0) {
            const predefinedRoles = [
                {nombre: 'Administrador'},
                {nombre: 'Docente'}
            ];

            try {
                await Rol.bulkCreate(predefinedRoles);
                logger.info({ predefinedRoles }, 'Roles predefinidos creados correctamente');
            } catch(err) {
                logger.error(err, 'Error al intentar crear los roles predefinidos');
            }
        }

    } catch(err) {
        logger.error(err, 'Error al verificar los roles existentes');
    }
};

export default generateRole;
