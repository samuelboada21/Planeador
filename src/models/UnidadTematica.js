import { DataTypes } from "sequelize";
//Importamos el objeto de conexión
import sequelize from "../database/db.js";
// Creamos el esquema del modelo
const UnidadTematica = sequelize.define(
  "Unidades_Tematicas",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El nombre de la unidad tematica no puede ser vacio",
        },
      },
    },
    descripcion: {
      type: DataTypes.TEXT,
    },
    materia_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Materias",
        key: "id",
      },
    },
  },
  {
    timestamps: true,
    createdAt: "fecha_creacion",
    updatedAt: "fecha_actualizacion",
    freezeTableName: true,
  }
);
// Exportamos el modelo
export default UnidadTematica;
