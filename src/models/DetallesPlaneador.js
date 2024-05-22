import { DataTypes } from "sequelize";

//Importamos el objeto de conexión
import sequelize from "../database/db.js";

// Creamos el esquema del modelo
const DetallesPlaneador = sequelize.define(
  "Detalles_Planeadores",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    valor_evaluacion: {
      type: DataTypes.ARRAY,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Los valores porcentuales de los instrumentos no pueden ser vacios",
        },
      },
    },
    estrategia_retroalimentacion: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Las estrategias de retroalimentacion para las actividades del planeador no pueden ser vacias",
        },
      },
    },
    semana_retroalimentacion: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "La semana de retroalimentación de las actividades no pueden ser vacia",
        },
      },
    },
    corte_periodo: {
      type: DataTypes.NUMBER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El periodo para realizar el corte no puede ser vacio",
        },
      },
    },
    semana_actividad_desarrollada: {
      type: DataTypes.ARRAY,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Las semanas en que se realizan las actividades no pueden ser vacías",
        },
      },
    },
    planeador_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Planeadores",
        key: "id",
      },
    },
    ra_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Resultados_Aprendizaje",
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
export default DetallesPlaneador;
