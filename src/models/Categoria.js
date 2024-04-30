import { DataTypes } from "sequelize";

// Importamos el objeto de conexión
import sequelize from "../database/db.js";

// Creamos el esquema del modelo
const Categoria = sequelize.define(
  "Categorias",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El nombre de la categoria no puede ser vacio",
        },
      },
      unique: {
        name: "nombre_categoria",
        msg: "Nombre de categoria ya en uso",
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
  },
  {
    timestamps: true,
    createdAt: "fecha_creacion",
    updatedAt: "fecha_actualizacion",
    freezeTableName: true,
  }
);

// Exportamos el modelo
export default Categoria;
