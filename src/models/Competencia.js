import { DataTypes } from "sequelize";

//Importamos el objeto de conexión
import sequelize from "../database/db.js";

// Creamos el esquema del modelo
const Competencia = sequelize.define(
  "Competencias",
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
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El nombre de la competencia no puede ser vacio",
        },
      },
      unique: {
        name: "nombre_competencia",
        msg: "Nombre de competencia ya en uso",
      },
    },
    descripcion: {
      type: DataTypes.TEXT,
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    categoria_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Categorias",
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
export default Competencia;
