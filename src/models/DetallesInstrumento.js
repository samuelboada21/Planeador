import { DataTypes } from 'sequelize';
//Importamos el objeto de conexión
import sequelize from '../database/db.js';
// Creamos el esquema del modelo
const DetallesInstrumento = sequelize.define(
    'Detalles_Instrumentos', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    detallesPlaneador_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Detalles_Planeadores',
            key: 'id'
        }
    },
    instrumento_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Instrumentos',
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
export default DetallesInstrumento;