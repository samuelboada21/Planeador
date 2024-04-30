import { DataTypes } from "sequelize";
//Importamos el objeto de conexión
import sequelize from "../database/db.js";
// Creamos el esquema del modelo
const Materia = sequelize.define(
  "Materias",
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
          msg: "El codigo de la materia no puede ser vacio",
        },
      },
      unique: {
        name: "codigo_materia",
        msg: "Codigo de materia ya en uso",
      },
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El nombre de la materia no puede ser vacio",
        },
      },
    },
    tipo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    creditos: {
      type: DataTypes.STRING,
      defaultValue: true,
      validate: {
        notEmpty: {
          msg: "Los creditos de la materia no pueden ser vacios",
        },
      },
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    semestre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El semestre de la materia no puede estar vacio",
        },
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
export default Materia;
