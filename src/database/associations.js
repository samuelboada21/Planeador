import User from '../models/Usuario.js';
import Rol from '../models/Rol.js';
import PasswordReset from '../models/PasswordReset.js';
import Categoria from '../models/Categoria.js';
import Competencia from '../models/Competencia.js';
import Resultado_Aprendizaje from '../models/ResultadoAprendizaje.js';

// Definimos la relación Usuario - PasswordReset
User.hasOne(PasswordReset, { foreignKey: 'usuario_id', onDelete: 'RESTRICT' });
PasswordReset.belongsTo(User, {
    foreignKey: 'usuario_id'
});

// Definimos la relación Usuario - Rol
Rol.hasMany(User, { foreignKey: 'rol_id', onDelete: 'RESTRICT' });
User.belongsTo(Rol, { foreignKey: 'rol_id' });

// Definimos la relación Categoria - Competencia
Categoria.hasMany(Competencia, { foreignKey: 'categoria_id', onDelete: 'RESTRICT' });
Competencia.belongsTo(Categoria, {
    foreignKey: 'categoria_id'
});

// Definimos la relación Competencia - Resultado_Aprendizaje
Competencia.hasMany(Resultado_Aprendizaje, { foreignKey: 'competencia_id', onDelete: 'RESTRICT' });
Resultado_Aprendizaje.belongsTo(Competencia, {
    foreignKey: 'competencia_id'
});