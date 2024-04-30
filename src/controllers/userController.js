import { Op } from "sequelize";
import Usuario from "../models/Usuario.js";
import bcrypt from "bcrypt";
import password_generator from "generate-password";
import encryptPasswd from "../util/encryptPassword.js";
import generateCorreo from "../util/emailGenerator.js";
import sequelize from "../database/db.js";
import XLSX from "xlsx";
import { tieneDuplicados } from "../util/duplicatedData.js";
import logger from "../middlewares/logger.js";

/* --------- getProfile function -------------- */
const getProfile = async (req, res, next) => {
  // Obtenemos el identificador del usuario
  const { id } = req.user;

  try {
    let excluded_attributes = [
      "password",
      "estado",
      "rol_id",
      "createdAt",
      "updatedAt",
      "deletedAt",
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
/* --------- updateTeacherDir function -------------- */

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

    // Si el estado cambió a false, establecemos la fecha de inactivación
    if (estado === false) {
      teacher.deletedAt = new Date();
    }

    // Actualizamos el docente
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

/* --------- createTeacher function -------------- */
const createTeacher = async (req, res, next) => {
  // Obtenemos los datos de el docente a crear
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
    // Comprobamos que no exista un docente con el mismo codigo o emails
    const teacherExist = await Usuario.findOne({
      where: {
        [Op.or]: [{ codigo }, { correo_personal }, { correo_institucional }],
      },
    });

    //comprobamos que no exista
    if (teacherExist) {
      req.log.warn(
        `El usuario con id ${req.user.id} esta tratando de asignar un codigo o email de docente actualmente en uso`
      );
      return res.status(400).json({
        error:
          "El docente ya está registrado, el código y los correos deben ser únicos",
      });
    } else {
      //generamos la contraseña
      const password = password_generator.generate({
        length: 15,
        numbers: true,
        symbols: true,
      });
      // Ciframos la contraseña
      const hashedPassword = await encryptPasswd(password);
      // Creamos el usuario
      await Usuario.create({
        codigo,
        nombre,
        tipo_vinculacion,
        departamento,
        area_formacion,
        correo_personal,
        correo_institucional,
        celular,
        password: hashedPassword,
        tipo: "Docente",
        rol_id: 2,
      });
    }

    // Enviamos correo de confirmación de registro
    await generateCorreo([correo_institucional]);

    // Respondemos a la petición
    return res.status(200).json({ message: "Docente creado correctamente" });
  } catch (error) {
    const errorUpdtTeaDir = new Error(
      `Ocurrio un problema al intentar crear el docente - ${error.message}`
    );
    errorUpdtTeaDir.stack = error.stack;
    next(errorUpdtTeaDir);
  }
};

/* --------- createTeachers function -------------- */
const createTeachers = async (req, res, next) => {
  try {
    //obtenemos el archivo excel
    const excelFileBuffer = req.files.archivo.data;
    // Procesamos el archivo excel y obtenemos los datos
    const workbook = XLSX.read(excelFileBuffer, {
      type: "buffer",
    });
    const workbookSheets = workbook.SheetNames;
    const sheet = workbookSheets[0];
    const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

    if (dataExcel.length === 0) {
      res.status(400);
      throw new Error("El archivo excel de docentes no puede estar vacio");
    }
    // Verificamos que no haya duplicados en los encabezados
    let headers = Object.keys(dataExcel[0]);
    let headersSet = new Set(headers);
    if (headers.length !== headersSet.size) {
      res.status(400);
      throw new Error("No se permite el uso de encabezados duplicados");
    }
    // Verificamos que no haya duplicados en el conjunto de docentes cargados
    if (tieneDuplicados(dataExcel)) {
      res.status(400);
      throw new Error(
        "No se permiten docentes con codigos o correos repetidos"
      );
    }
    // Obtenemos todos los docentes existentes
    const existingTeachers = await Usuario.findAll({
      where: {
        tipo: "Docente",
      },
      attributes: [
        "id",
        "codigo",
        "correo_personal",
        "correo_institucional",
        "fecha_inactivacion",
      ],
      paranoid: false,
    });

    //Inicializamos la transacción
    const result = await sequelize.transaction(async (t) => {
      // Arreglo que contiene los datos de los docentes nuevos
      const newTeachers = [];
      let teachersRestore = 0;

      // Registramos los datos de los usuarios
      for (const itemFila of dataExcel) {
        // Validar las cabeceras del archivo
        if (
          !itemFila["codigo"] ||
          !itemFila["nombre"] ||
          !itemFila["tipo_vinculacion"] ||
          !itemFila["departamento"] ||
          !itemFila["area_formacion"] ||
          !itemFila["correo_personal"] ||
          !itemFila["correo_institucional"] ||
          !itemFila["celular"]
        ) {
          res.status(400);
          throw new Error("Formato de archivo no correspondiente");
        }

        // Validamos el formato del codigo
        const codeRegex = /^\d{4,7}$/;
        if (!codeRegex.test(itemFila["codigo"])) {
          res.status(400);
          throw new Error("No se permiten codigos de docentes no validos");
        }
        const codigo = itemFila["codigo"];

        // Validamos el formato del nombre
        const regexName =
          /^(?! )[A-Za-zÀ-ÖØ-öø-ÿ]+(?: [A-Za-zÀ-ÖØ-öø-ÿ]+)*(?<! )$/;
        // Verifica si el nombre cumple con el formato requerido
        if (!regexName.test(itemFila["nombre"])) {
          res.status(400);
          throw new Error("El formato de nombre no es válido");
        }
        // Función para formatear el nombre
        function formatName(name) {
          // Divide el nombre en palabras
          const words = name.split(/\s+/);
          // Capitaliza la primera letra de cada palabra y une las palabras con un espacio
          return words
            .map(
              (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(" ");
        }
        // Obtiene el nombre del usuario y lo formatea
        const nombre = formatName(itemFila["nombre"]);

        // Validamos el formato del nombre y apellido
        const regextda =
          /^(?! )[a-zA-ZÀ-ÖØ-öø-ÿ0-9]+( [a-zA-ZÀ-ÖØ-öø-ÿ0-9]+)*(?<! )$/;
        if (
          !regextda.test(itemFila["tipo_vinculacion"]) ||
          !regextda.test(itemFila["departamento"]) ||
          !regextda.test(itemFila["area_formacion"])
        ) {
          res.status(400);
          throw new Error(
            "El formato de tipo de vinculacion, departamento o area de formacion no son validos"
          );
        }
        const tipo_vinculacion = itemFila["tipo_vinculacion"];
        const departamento = itemFila["departamento"];
        const area_formacion = itemFila["area_formacion"];

        // Validamos el formato del correo personal
        const regexMailpersonal = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexMailpersonal.test(itemFila["correo_personal"])) {
          res.status(400);
          throw new Error("El formato de correo personal no es valido");
        }
        const correo_personal = itemFila["correo_personal"];

        // Validamos el formato del correo institucional
        const regexMailInstitucional = /^[a-zA-Z0-9._%+-]+@ufps.edu.co$/;
        if (!regexMailInstitucional.test(itemFila["correo_institucional"])) {
          res.status(400);
          throw new Error(
            "El formato de correo institucional no es valido, debe coincidir con el dominio de la UFPS"
          );
        }
        const correo_institucional = itemFila["correo_institucional"];

        // Validamos el formato del celular
        const regexCelular = /^\d{10}$/;
        if (!regexCelular.test(itemFila["celular"])) {
          res.status(400);
          throw new Error("El numero de celular debe contener 10 digitos");
        }
        const celular = itemFila["celular"];

        // Verificamos si el docente ya existe tanto en los usuarios actuales como inactivos
        const existingTeacher = existingTeachers.find(
          (teacher) =>
            teacher.codigo === codigo ||
            teacher.correo_institucional === correo_institucional
        );
        // En caso de existir solo notificamos al usuario y creamos su inscripcion
        if (existingTeacher) {
          if (existingTeacher.fecha_inactivacion !== null){
            await existingTeacher.restore();
            teachersRestore++;
          }
        } else {
          // Generamos la contraseña
          const newPassword = password_generator.generate({
            length: 15,
            numbers: true,
            symbols: true,
          });

          // Ciframos la contraseña
          const hashedPassword = await encryptPasswd(newPassword);

          newTeachers.push({
            codigo,
            nombre,
            tipo_vinculacion,
            departamento,
            area_formacion,
            correo_personal,
            correo_institucional,
            celular,
            password: hashedPassword,
            tipo: "Docente",
            rol_id: 2,
          });
        }
      }
      // Registramos a los docentes nuevos
      await Usuario.bulkCreate(newTeachers, {
        returning: true,
        transaction: t,
      });

      const teachers_correos = newTeachers.map((teacher) => {
        return teacher.correo_institucional;
      });

      if (teachers_correos.length === 0 && teachersRestore === 0) {
        res.status(400);
        throw new Error(
          "No hay docentes nuevos para agregar, tampoco para restaurar"
        );
      }
      // Enviamos correo de confirmación de registro
      if (teachers_correos.length > 0) {
        await generateCorreo(teachers_correos);
      }

      return {
        newTeachersL: newTeachers.length,
        teachersRestoreN: teachersRestore,
      };
    });

    res.status(200).json({
      message: `Se han inscrito ${result.newTeachersL} docentes nuevos y se han restaurado ${result.teachersRestoreN} docentes satisfactoriamente al sistema`,
    });
  } catch (error) {
    const errorCargaTeacher = new Error(
      `Ocurrio un problema al intentar cargar el listado de docentes - ${error.message}`
    );
    errorCargaTeacher.stack = error.stack;
    next(errorCargaTeacher);
  }
};

const userController = {
  getTeachers,
  getTeacherById,
  updateTeacherData,
  updateTeacherDataDir,
  getDirectors,
  getDirectorById,
  createTeacher,
  createTeachers,
  updateDirector,
  updatePassword,
  getProfile,
  deleteTeacher,
};

export default userController;
