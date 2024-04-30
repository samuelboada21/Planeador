import { DataTypes } from "sequelize";
//Importamos el objeto de conexión
import sequelize from "../database/db.js";
// Creamos el esquema del modelo
const Subtema = sequelize.define(
  "Subtemas",
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
          msg: "El nombre del subtema no puede ser vacio",
        },
      },
    },
    descripcion: {
      type: DataTypes.TEXT,
    },
    unidad_tematica_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Unidades_Tematicas",
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
export default Subtema;
