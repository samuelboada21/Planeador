import { DataTypes } from "sequelize";
//Importamos el objeto de conexión
import sequelize from "../database/db.js";
// Creamos el esquema del modelo
const InstrumentoEvaluacion = sequelize.define(
  "Instrumentos",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    codigo: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El codigo del instrumento no puede ser vacio",
        },
      },
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El instrumento de evaluacion no puede ser vacio",
        },
      },
      unique: {
        name: "nombre_instrumento",
        msg: "Instrumento ya registrado",
      },
    },
    descripcion: {
      type: DataTypes.TEXT,
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
export default InstrumentoEvaluacion;
