import { DataTypes } from 'sequelize';
//Importamos el objeto de conexión
import sequelize from '../database/db.js';
// Creamos el esquema del modelo
const MateriaCompetencia = sequelize.define(
    'Materias_competencias', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    materia_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Materias',
            key: 'id'
        }
    },
    competencia_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Competencias',
            key: 'id'
        }
    }
}, {
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    freezeTableName: true
});

// Exportamos el modelo
export default MateriaCompetencia;