import { DataTypes } from "sequelize";
//Importamos el objeto de conexión
import sequelize from "../database/db.js";
// Creamos el esquema del modelo
const TipoEvidencia = sequelize.define(
  "Tipo_Evidencias",
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
          msg: "El tipo de evidencia no puede ser vacio",
        },
      },
    },
    ra_curso_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Ra_Cursos",
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
export default TipoEvidencia;
