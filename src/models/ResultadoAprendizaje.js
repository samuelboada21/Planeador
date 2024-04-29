import { DataTypes } from "sequelize";
//Importamos el objeto de conexión
import sequelize from "../database/db.js";

// Creamos el esquema del modelo
const ResultadoAprendizaje = sequelize.define(
  "Resultados_Aprendizaje",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    codigo:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "La descripcion del RA no puede ser vacio",
        },
      },
      unique: {
        name: "descripcion_ra",
        msg: "Descripcion del resultado de aprendizaje ya en uso",
      },
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    competencia_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Competencias",
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
export default ResultadoAprendizaje;
