import { DataTypes } from "sequelize";
//Importamos el objeto de conexión
import sequelize from "../database/db.js";
// Creamos el esquema del modelo
const RaCurso = sequelize.define(
  "Ra_Curso",
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
          msg: "El nombre del resultado de aprendizaje del curso no puede ser vacio",
        },
      },
    },
    estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
export default RaCurso;
