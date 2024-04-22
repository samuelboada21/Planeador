import { Op } from "sequelize";
import Usuario from "../models/Usuario.js";
import bcrypt from "bcrypt";

/* --------- getProfile function -------------- */
const getProfile = async (req, res, next) => {
  // Obtenemos el identificador del usuario
  const { id } = req.user;

  try {
    let excluded_attributes = [
      "password",
      "estado",
      "rol_id",
      "fecha_creacion",
      "fecha_actualizacion",
      "fecha_inactivacion",
    ];

    // Buscamos el usuario
    const existUser = await Usuario.findByPk(id, {
      attributes: { exclude: excluded_attributes },
    });

    return res.status(200).json(existUser);
  } catch (error) {
    const errorGetPerfil = new Error(
      `Ocurrio un problema al obtener el perfil del usuario - ${error.message}`
    );
    errorGetPerfil.stack = error.stack;
    next(errorGetPerfil);
  }
};

/* --------- getTeachers function -------------- */

const getTeachers = async (req, res, next) => {
  // Obtenemos el estado de los docentes a filtrar
  const state = req.query.estado || true;

  try {
    // Consultamos a los docentes
    const teachers = await Usuario.findAll({
      where: {
        tipo: "Docente",
        estado: state,
      },
      attributes: [
        "id",
        "codigo",
        "nombre",
        "tipo_vinculacion",
        "departamento",
        "area_formacion",
        "correo_personal",
        "correo_institucional",
        "celular",
        "estado",
      ],
    });

    // Respondemos al usuario
    res.status(200).json(teachers);
  } catch (error) {
    const errorGetTea = new Error(
      `Ocurrio un problema al intentar obtener los docentes - ${error.message}`
    );
    errorGetTea.stack = error.stack;
    next(errorGetTea);
  }
};

/* --------- getTeacherById function -------------- */
const getTeacherById = async (req, res, next) => {
  // Obtenemos el id del docente
  const { id } = req.params;

  try {
    // Obtenemos el docente
    const teacher = await Usuario.findOne({
      where: {
        id,
        tipo: "Docente",
      },
      attributes: [
        "codigo",
        "nombre",
        "tipo_vinculacion",
        "departamento",
        "area_formacion",
        "correo_personal",
        "correo_institucional",
        "celular",
        "estado",
      ],
    });

    if (!teacher) {
      req.log.warn("Intento de acceso a docente inexistente");
      return res
        .status(400)
        .json({ error: "No es posible identificar al docente especificado" });
    }

    // Respondemos al usuario
    res.status(200).json(teacher);
  } catch (error) {
    const errorGetTeatId = new Error(
      `Ocurrio un problema al intentar obtener la información del docente especificado - ${error.message}`
    );
    errorGetTeatId.stack = error.stack;
    next(errorGetTeatId);
  }
};

/* --------- updateTeacherData function -------------- */
const updateTeacherData = async (req, res, next) => {
  // Obtenemos el id del docente
  const { id } = req.user;

  // Obtenemos los datos a actualizar
  const { nombre, correo_personal, celular } = req.body;

  try {
    // Obtenemos el docente y verificamos su existencia
    const teacher = await Usuario.findOne({
      where: {
        id,
        tipo: "Docente",
      },
    });

    // Actualizamos el docente
    await teacher.update({
      nombre,
      correo_personal,
      celular,
    });

    // Respondemos a la petición
    res.status(200).json({ message: "Actualización realizada correctamente" });
  } catch (error) {
    const errorUpdtTea = new Error(
      `Ocurrio un problema al actualizar el docente especificado - ${error.message}`
    );
    errorUpdtTea.stack = error.stack;
    next(errorUpdtTea);
  }
};

// ------------ Métodos para el Director (sobre el estudiante) ------------------
/* --------- updateStudentDir function -------------- */

const updateTeacherDataDir = async (req, res, next) => {
  //Obtenemos el id del docente a actualizar
  const { id } = req.params;

  // Obtenemos los datos a actualizar
  const {
    codigo,
    nombre,
    tipo_vinculacion,
    departamento,
    area_formacion,
    correo_personal,
    correo_institucional,
    celular,
    estado,
  } = req.body;

  try {
    // Obtenemos el docente y verificamos su existencia
    const teacher = await Usuario.findOne({
      where: {
        id,
        rol_id: 2,
      },
    });

    if (!teacher) {
      req.log.warn("Intento de acceso a docente inexistente");
      return res.status(400).json({
        error: "No se encuentra ningun docente asociado con el id especificado",
      });
    }

    // Comprobamos que no exista un docente con el mismo codigo o email
    const teacherExist = await Usuario.findOne({
      where: {
        [Op.or]: [{ codigo }, { correo_personal }, { correo_institucional }],
      },
    });

    if (teacherExist && teacherExist.id !== teacher.id) {
      req.log.warn(
        `El usuario con id ${req.user.id} esta tratando de asignar un codigo o email de docente actualmente en uso`
      );
      return res
        .status(400)
        .json({ error: "El código y email del docente deben ser únicos" });
    }

    // Actualizamos el estudiante
    await teacher.update({
      codigo,
      nombre,
      tipo_vinculacion,
      departamento,
      area_formacion,
      correo_personal,
      correo_institucional,
      celular,
      estado,
    });

    // Respondemos a la petición
    return res
      .status(200)
      .json({ message: "Docente actualizado correctamente" });
  } catch (error) {
    const errorUpdtTeaDir = new Error(
      `Ocurrio un problema al intentar actualizar el docente - ${error.message}`
    );
    errorUpdtTeaDir.stack = error.stack;
    next(errorUpdtTeaDir);
  }
};

/* --------- getDirectors function -------------- */

const getDirectors = async (req, res, next) => {
  try {
    //Obtenemos los directores
    const directors = await Usuario.findAll({
      where: { tipo: "Director" },
      attributes: [
        "id",
        "codigo",
        "nombre",
        "tipo_vinculacion",
        "departamento",
        "area_formacion",
        "correo_personal",
        "correo_institucional",
        "celular",
        "estado",
      ],
    });

    // Respondemos al usuario
    res.status(200).json(directors);
  } catch (error) {
    const errorGetDir = new Error(
      `Ocurrio un problema al intentar obtener los datos de los directores - ${error.message}`
    );
    errorGetDir.stack = error.stack;
    next(errorGetDir);
  }
};

/* --------- getDirectorById function -------------- */

const getDirectorById = async (req, res) => {
  //Obtenemos el id del director
  const { id } = req.params;

  try {
    // Obtenemos el director y validamos su existencia
    const director = await Usuario.findOne({
      where: {
        id,
        rol_id: 1,
      },
      attributes: [
        "id",
        "codigo",
        "nombre",
        "tipo_vinculacion",
        "departamento",
        "area_formacion",
        "correo_personal",
        "correo_institucional",
        "celular",
        "estado",
      ],
    });

    if (!director) {
      return res.status(400).json({
        error:
          "No se encuentra ningun director asociado con el id especificado",
      });
    }

    // Respondemos al usuario
    res.status(200).json(director);
  } catch (error) {
    const errorGetDirId = new Error(
      `Ocurrio un problema al intentar obtener los datos del director - ${error.message}`
    );
    errorGetDirId.stack = error.stack;
    next(errorGetDirId);
  }
};

/* --------- updateDirector function -------------- */
const updateDirector = async (req, res, next) => {
  //Obtenemos el id del director a actualizar
  const { id } = req.user;

  // Obtenemos los datos a actualizar
  const {
    codigo,
    nombre,
    tipo_vinculacion,
    departamento,
    area_formacion,
    correo_personal,
    correo_institucional,
    celular,
  } = req.body;

  try {
    //Obtenemos y verificamos el director
    const director = await Usuario.findOne({
      where: {
        id,
        rol_id: 1,
      },
    });

    //Comprobamos que no exista un director con el mismo codigo y email
    const directorExist = await Usuario.findOne({
      where: {
        [Op.or]: [{ codigo }, { correo_institucional }],
      },
    });

    if (directorExist && directorExist.id !== director.id) {
      req.log.warn(
        `Intento de uso de credenciales de administrador ya registradas`
      );
      res.status(400).json({
        error:
          "El codigo y correo institucinal de el director deben ser unicos",
      });
    }

    //Actualizamos el director
    await director.update({
      codigo,
      nombre,
      tipo_vinculacion,
      departamento,
      area_formacion,
      correo_personal,
      correo_institucional,
      celular,
    });

    //Respondemos a la petición
    res.status(200).json({ message: "Datos actualizados correctamente" });
  } catch (error) {
    const errorUpdtDir = new Error(
      `Ocurrio un problema al actualizar los datos del director - ${error.message}`
    );
    errorUpdtDir.stack = error.stack;
    next(errorUpdtDir);
  }
};

/* --------- updatePassword function -------------- */
const updatePassword = async (req, res, next) => {
  // Obtenemos el identificador del admin
  const { id } = req.user;

  // Obtenemos la contraseña actual y la nueva contraseña a actualizar
  const { password, newPassword } = req.body;

  try {
    // Verificamos la existencia del usuario
    const user = await Usuario.findByPk(id);

    // Comparamos la contraseña ingreasada
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      req.log.warn(
        "Uso de credenciales incorrectas al actualizar la contraseña"
      );
      return res.status(400).json({
        error: `La contraseña ingresada no corresponde con la original`,
      });
    }

    // Hasheamos la nueva contraseña
    const genSalt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(newPassword, genSalt);

    // Actualizamos la contraseña del administrador
    await user.update({
      password: hash,
    });

    res.status(200).json({ message: "Contraseña cambiada correctamente" });
  } catch (error) {
    const errorUpdtPassDir = new Error(
      `Ocurrio un problema al intentar cambiar la contrasenia - ${error.message}`
    );
    errorUpdtPassDir.stack = error.stack;
    next(errorUpdtPassDir);
  }
};

/* --------- deleteTeacher function -------------- */
const deleteTeacher = async (req, res, next) => {
  // Obtenemos el identificador del docente
  const { id } = req.params;

  try {
    // Verificamos la existencia del usuario
    const user = await Usuario.findByPk(id);

    if (!user) {
      req.log.warn("Intento de desvinculación de un usuario inexistente");
      return res
        .status(400)
        .json({ error: "No se encontro al usuario especificado" });
    }

    if (user.tipo !== "Docente")
      return res.status(400).json({ error: "Acción no permitida" });

    // Eliminamos la cuenta del usuario
    await user.destroy();

    res.status(200).json({
      message: "El usuario ha sido desvinculado de la plataforma correctamente",
    });
  } catch (error) {
    const errorDelUser = new Error(
      `Ocurrio un problema al intentar desvincular al docente - ${error.message}`
    );
    errorDelUser.stack = error.stack;
    next(errorDelUser);
  }
};

const userController = {
  getTeachers,
  getTeacherById,
  updateTeacherData,
  updateTeacherDataDir,
  getDirectors,
  getDirectorById,
  updateDirector,
  updatePassword,
  getProfile,
  deleteTeacher,
};

export default userController;
