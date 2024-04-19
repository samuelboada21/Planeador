import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";

const Usuario = sequelize.define(
  "Usuarios",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    codigo_docente: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    nombre_docente: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tipo_vinculacion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    departamento: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    area_formacion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    correo_personal: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    correo_institucional: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    celular: {
      type: DataTypes.STRING,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    rol_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "Roles",
        key: "id",
      },
    },
  },
  {
    paranoid: true,
    deletedAt: "fecha_inactivacion",
    timestamps: true,
    createdAt: "fecha_creacion",
    updatedAt: "fecha_actualizacion",
    freezeTableName: true,
  }
);

export default Usuario;
