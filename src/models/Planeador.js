import { DataTypes } from "sequelize";

//Importamos el objeto de conexión
import sequelize from "../database/db.js";

// Creamos el esquema del modelo
const Planeador = sequelize.define(
  "Planeadores",
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
          msg: "El nombre del planeador no puede ser vacio",
        },
      },
      unique: {
        name: "nombre_planeador",
        msg: "Nombre de planeador ya en uso",
      },
    },
    area_formacion: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El area de formacion del planeador no puede ser vacio",
        },
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Usuarios",
        key: "id",
      },
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
export default Planeador;
