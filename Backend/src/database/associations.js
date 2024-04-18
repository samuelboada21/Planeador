import User from '../models/Usuario.js';
import Rol from '../models/Rol.js';

// Definimos la relación Usuario - Rol
Rol.hasMany(User, { foreignKey: 'rol_id', onDelete: 'RESTRICT' });
User.belongsTo(Rol, { foreignKey: 'rol_id' });
