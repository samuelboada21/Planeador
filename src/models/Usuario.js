import { DataTypes } from "sequelize";
import encrypt from "../util/encryptPassword.js";
import sequelize from "../database/db.js";
import PasswordReset from "./PasswordReset.js";

const Usuario = sequelize.define(
  "Usuarios",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    codigo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: "users_code",
        msg: "El codigo proporcionado ya existe",
      },
    },
    nombre: {
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
    tipo: {
      type: DataTypes.ENUM("Director", "Docente"),
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
    hooks: {
      beforeCreate: async (user, options) => {
        try {
          const hashedPassword = await encrypt(user.password);
          user.password = hashedPassword;
        } catch (err) {
          const errorPassword = new Error(
            `Error al intentar encriptar la contraseña del usuario con ID ${user.id}`
          );
          errorPassword.stack = err.stack;
          throw errorPassword;
        }
      },
      beforeDestroy: async (user, options) => {
        try {
          await Promise.all([
            PasswordReset.destroy({ where: { usuario_id: user.id } }),
          ]);
        } catch (err) {
          const errorDelete = new Error(
            `Error al intentar eliminar datos relacionados al usuario con ID ${user.id}`
          );
          errorDelete.stack = err.stack;
          throw errorDelete;
        }
      },
    },
    paranoid: true,
    deletedAt: "fecha_inactivacion",
    timestamps: true,
    createdAt: "fecha_creacion",
    updatedAt: "fecha_actualizacion",
    freezeTableName: true,
  }
);

export default Usuario;
