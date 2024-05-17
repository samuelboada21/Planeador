import { DataTypes } from 'sequelize';
//Importamos el objeto de conexión
import sequelize from '../database/db.js';
// Creamos el esquema del modelo
const TipoInstrumento = sequelize.define(
    'Tipo_instrumento', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    tipo_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Tipo_Evidencias',
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
export default TipoInstrumento;