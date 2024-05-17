import RaCurso from "../models/RaCurso.js";
import Materia from "../models/Materia.js";
import TipoEvidencia from "../models/TipoEvidencia.js";
import XLSX from "xlsx";
import sequelize from "../database/db.js";

/* --------- getRaCursos function -------------- */
const getRaCursos = async (req, res, next) => {
  // Estado
  const state = req.query.estado || true;
  try {
    // Obtenemos los ra cursos
    const raCursos = await RaCurso.findAll({
      where: {
        estado: state,
      },
      attributes: ["id", "nombre", "estado"],
      include: {
        model: Materia,
        attributes: ["codigo", "nombre"],
      },
    });
    // Respondemos al usuario
    res.status(200).json(raCursos);
  } catch (err) {
    const errorGetRaC = new Error(
      `Ocurrio un problema al obtener los resultados de aprendizajes de curso - ${err.message}`
    );
    errorGetRaC.stack = err.stack;
    next(errorGetRaC);
  }
};

/* --------- getRaCursoById function -------------- */
const getRaCursoById = async (req, res, next) => {
  // Obtenemos el id del ra curso a obtener
  const { id } = req.params;
  try {
    // Obtenemos y verificamos el ra Curso
    const raCurso = await RaCurso.findByPk(id, {
      attributes: ["nombre", "estado"],
      include: [
        {
          model: Materia,
          attributes: ["codigo", "nombre"],
        },
      ],
    });
    if (!raCurso) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento acceder a un ra curso no especificado`
      );
      return res.status(400).json({
        error:
          "No se encuentra ningun resultado de aprendizaje de curso con el id especificado",
      });
    }
    // Respondemos al usuario
    res.status(200).json(raCurso);
  } catch (err) {
    const errorGetRaCId = new Error(
      `Ocurrio un problema al obtener los datos del resultado de aprendizaje de curso especificado - ${err.message}`
    );
    errorGetRaCId.stack = err.stack;
    next(errorGetRaCId);
  }
};

/* --------- createRaCurso function -------------- */
const createRaCurso = async (req, res) => {
  // Obtenemos los datos del ra curso a crear
  const { nombre, materia_id } = req.body;
  try {
    // Buscar la materia para la que se quiere crear el ra curso
    const materia = await Materia.findByPk(materia_id);
    if (!materia) {
      return res
        .status(404)
        .json({ error: "La materia especificada no existe" });
    }
    // Verificar si el ra curso ya está asociada a la materia
    const raCursoExistente = await RaCurso.findOne({
      where: {
        nombre,
        materia_id: materia_id,
      },
    });

    if (raCursoExistente) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento crear un ra curso ya registrado en la materia`
      );
      return res.status(400).json({
        error: `El ra curso ${nombre} ya se encuentra registrado en esta materia`,
      });
    }
    // Creamos el ra curso
    await RaCurso.create({
      nombre: nombre.toLowerCase(),
      materia_id,
    });
    // Respondemos al usuario
    res
      .status(200)
      .json({
        message: "Resultado de aprendizaje de curso creado exitosamente",
      });
  } catch (err) {
    const errorCreateRac = new Error(
      `Ocurrio un problema al crear el resultado de aprendizaje de curso - ${err.message}`
    );
    errorCreateRac.stack = err.stack;
    next(errorCreateRac);
  }
};

/* --------- updateRaCurso function -------------- */
const updateRaCurso = async (req, res, next) => {
  // Obtenemos el id del ra curso a actualizar
  const { id } = req.params;
  // Obtenemos los datos a actualizar
  const { nombre, estado, materia_id } = req.body;
  try {
    // Hacemos las verificaciones del ra curso en paralelo
    const [raCurso, raCursoFound] = await Promise.all([
      RaCurso.findByPk(id),
      RaCurso.findOne({
        where: {
          nombre,
          materia_id: materia_id,
        },
      }),
    ]);
    // verificamos el ra Curso
    if (!raCurso) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento acceder a un ra curso inexistente.`
      );
      return res.status(400).json({
        error:
          "No se encuentra ningun resultado de aprendizaje de curso con el id especificado",
      });
    }
    // Comprobamos que el nombre sea unico
    if (raCursoFound && raCurso.nombre !== raCursoFound.nombre) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento usar un nombre de resultado de aprendizaje de curso ya registrado en la materia`
      );
      return res.status(400).json({
        error: `El nombre del resultado de aprendizaje de curso ${nombre} ya se encuentra registrado en la materia`,
      });
    }
    // Actualizamos el ra curso
    await raCurso.update({
      nombre: nombre.toLowerCase(),
      estado,
      materia_id,
    });
    // Respondemos al usuario
    res
      .status(200)
      .json({
        message: "resultado de aprendizaje de curso actualizado correctamente",
      });
  } catch (err) {
    const errorUpdateRaC = new Error(
      `Ocurrio un problema al actualizar el resultado de aprendizaje de curso - ${err.message}`
    );
    errorUpdateRaC.stack = err.stack;
    next(errorUpdateRaC);
  }
};

/* --------- createRaCurso function -------------- */
const createRaCursos = async (req, res, next) => {
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
      throw new Error(
        "El archivo excel de resultados de aprendizaje de curso no puede estar vacio"
      );
    }
    // Verificamos que no haya duplicados en los encabezados
    let headers = Object.keys(dataExcel[0]);
    let headersSet = new Set(headers);
    if (headers.length !== headersSet.size) {
      res.status(400);
      throw new Error("No se permite el uso de encabezados duplicados");
    }

    //Inicializamos la transacción
    const result = await sequelize.transaction(async (t) => {
      // Arreglo que contiene los datos de los ra curso nuevos
      const newRaCursos = [];
      // Registramos los datos de los ra curso
      for (const itemFila of dataExcel) {
        // Validar las cabeceras del archivo
        if (
          !itemFila["codigo_materia"] ||
          !itemFila["resultados_aprendizaje_curso"]
        ) {
          res.status(400);
          throw new Error("Formato de archivo no correspondiente");
        }
        // Validamos el formato del codigo
        const codeRegex = /^\d{7}$/;
        if (!codeRegex.test(itemFila["codigo_materia"])) {
          res.status(400);
          throw new Error("No se permiten codigos de materias no validos");
        }
        const codigoMateria = itemFila["codigo_materia"];

        // Buscar la materia correspondiente en la base de datos
        const materia = await Materia.findOne({
          where: {
            codigo: codigoMateria,
          },
        });
        // Verificar si la materia existe
        if (!materia) {
          res.status(400);
          throw new Error(
            `No se encontró la materia con el código ${codigoMateria}`
          );
        }
        // Obtener el id de la materia encontrada
        const materiaId = materia.id;
        const raCursos = itemFila["resultados_aprendizaje_curso"]
          .split("||")
          .map((raCurso) => raCurso.trim().toLowerCase());
        // Buscar si hay unidades temáticas iguales en la misma materia
        for (const raCurso of raCursos) {
          const raCursoExistente = await RaCurso.findOne({
            where: {
              nombre: raCurso,
              materia_id: materiaId,
            },
          });

          if (!raCursoExistente) {
            newRaCursos.push({
              nombre: raCurso,
              materia_id: materiaId,
            });
          }
        }
      }
      // Registramos los ra curso nuevos
      await RaCurso.bulkCreate(newRaCursos, {
        transaction: t,
      });

      return {
        newRaCursoL: newRaCursos.length,
      };
    });

    res.status(200).json({
      message: `Se han creado ${result.newRaCursoL} resultados de aprendizaje de curso nuevos satisfactoriamente al sistema`,
    });
  } catch (error) {
    const errorCargaRaCurso = new Error(
      `Ocurrio un problema al intentar cargar el listado de resultado de aprendizaje de curso - ${error.message}`
    );
    errorCargaRaCurso.stack = error.stack;
    next(errorCargaRaCurso);
  }
};
/* --------- deleteRaCurso function -------------- */
const deleteRaCurso = async (req, res, next) => {
  // Obtenemos el identificador del ra curso
  const { id } = req.params;
  try {
    // Verificamos la existencia del ra curso
    const raCurso = await RaCurso.findByPk(id);
    if (!raCurso) {
      req.log.warn("Intento de desvinculación de un ra curso inexistente");
      return res
        .status(400)
        .json({
          error:
            "No se encontro el resultado de aprendizaje de curso especificado",
        });
    }
    // Buscar y eliminar todos los tipos de evidencia asociados al ra curso especificado
    await TipoEvidencia.destroy({ where: { ra_curso_id: raCurso.id } });

    // Eliminar el ra curso
    await raCurso.destroy();
    res.status(200).json({
      message:
        "El resultado de aprendizaje de curso ha sido desvinculado de la plataforma correctamente",
    });
  } catch (error) {
    const errorDelRaC = new Error(
      `Ocurrio un problema al intentar desvincular el resultado de aprendizaje de curso - ${error.message}`
    );
    errorDelRaC.stack = error.stack;
    next(errorDelRaC);
  }
};

const controller = {
  getRaCursos,
  getRaCursoById,
  createRaCurso,
  updateRaCurso,
  createRaCursos,
  deleteRaCurso,
};

export default controller;
