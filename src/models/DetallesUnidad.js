import { DataTypes } from 'sequelize';
//Importamos el objeto de conexión
import sequelize from '../database/db.js';
// Creamos el esquema del modelo
const DetallesUnidad = sequelize.define(
    'Detalles_Unidades', {
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
    unidad_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Unidades_Tematicas',
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
export default DetallesUnidad;