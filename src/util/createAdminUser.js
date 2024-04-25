import Usuario from '../models/Usuario.js';
import Rol from '../models/Rol.js';
import logger from '../middlewares/logger.js';
import validateData from './validateData.js';
import { usuarioSchema } from '../schemas/userSchema.js';


// Función encargada de crear el usuario administrador
const createAdminUser = async () => {

    try{
        // Verificamos que el admin no exista
        const admin = await Usuario.findOne({
            where: {
                correo_institucional: 'monicamarcelarg@ufps.edu.co'
            }
        });

        if(!admin){
            // Obtenemos el rol de administrador 
            const adminRole = await Rol.findOne({
                where: {nombre: 'Administrador'}
            });

            // Validamos los datos
            const newAdmin = {
                codigo: '1152015',
                nombre: 'Samuel Omar Boada Barrera',
                tipo_vinculacion: 'DOCENTE PLANTA',
                departamento: 'SISTEMAS E INFORMATICA',
                area_formacion: 'Profesional Especifico',
                correo_personal: 'omarsamuel@gmail.com',
                correo_institucional: 'monicamarcelarg@ufps.edu.co',
                celular: '3023023232',
                password: 'administrador1234',
                tipo: 'Director',
                rol_id: adminRole.id

            }

            const errors = validateData(usuarioSchema, newAdmin);

            if (errors.length > 0) throw new Error(errors.join(', '));

            // Creamos el usuario - en caso de que todo haya ido bien
            const admin = await Usuario.create({
                codigo: newAdmin.codigo,
                nombre: newAdmin.nombre,
                tipo_vinculacion: newAdmin.tipo_vinculacion,
                departamento: newAdmin.departamento,
                area_formacion: newAdmin.area_formacion,
                correo_personal: newAdmin.correo_personal,
                correo_institucional: newAdmin.correo_institucional,
                celular: newAdmin.celular,
                password: newAdmin.password,
                tipo: newAdmin.tipo,
                rol_id: newAdmin.rol_id
            });

            logger.info(
                { user_id: admin.id, user_name: admin.nombre, user_correo: admin.correo_institucional 
                }, 'Usuario administrador creado correctamente');

        }


    }catch(error){
        logger.error(error, `Error al intentar crear usuario administrador`);
    }

};

export default createAdminUser;