import Rol from '../models/Rol.js';

// Función para generar roles por defecto
const generateRole = async () => {
    try {
        // Verificar si ya existen roles en la base de datos
        const existingRoles = await Rol.findAll();
        
        // Si no existen roles, los creamos
        if (existingRoles.length === 0) {
            const predefinedRoles = [
                { nombre: 'Administrador' },
                { nombre: 'Docente' }
            ];
            // Insertar los roles predefinidos en la base de datos
            await Rol.bulkCreate(predefinedRoles);
            console.log('Roles predefinidos creados correctamente');
        } else {
            console.log('Los roles ya existen en la base de datos');
        }
    } catch (error) {
        console.error('Error al generar roles por defecto:', error);
    }
};

export default generateRole;
