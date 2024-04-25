import User from '../models/Usuario.js';
import Rol from '../models/Rol.js';
import PasswordReset from '../models/PasswordReset.js';

// Definimos la relación Usuario - PasswordReset
User.hasOne(PasswordReset, { foreignKey: 'usuario_id', onDelete: 'RESTRICT' });
PasswordReset.belongsTo(User, {
    foreignKey: 'usuario_id'
});

// Definimos la relación Usuario - Rol
Rol.hasMany(User, { foreignKey: 'rol_id', onDelete: 'RESTRICT' });
User.belongsTo(Rol, { foreignKey: 'rol_id' });
