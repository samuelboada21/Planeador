import UnidadTematica from "../models/UnidadTematica.js";
import Subtema from "../models/Subtema.js";
import Materia from "../models/Materia.js";
import XLSX from "xlsx";
import { tieneDuplicadosMateria } from "../util/duplicatedData.js";
import sequelize from "../database/db.js";
import logger from "../middlewares/logger.js";

/* --------- getUnidades function -------------- */
const getUnidades = async (req, res, next) => {
  try {
    // Obtenemos las unidades
    const unidades = await UnidadTematica.findAll({
      attributes: ["id", "nombre", "descripcion"],
      include: {
        model: Materia,
        attributes: ["codigo", "nombre"],
      },
    });
    // Respondemos al usuario
    res.status(200).json(unidades);
  } catch (err) {
    const errorGetUni = new Error(
      `Ocurrio un problema al obtener las unidades tematicas - ${err.message}`
    );
    errorGetUni.stack = err.stack;
    next(errorGetUni);
  }
};

/* --------- getUnidadesByMateria function -------------- */
const getUnidadesByMateria = async (req, res, next) => {
  const { id } = req.params; // Obtenemos el ID de la materia
  try {
    // Verificamos si la materia existe
    const materia = await Materia.findByPk(id);
    if (!materia) {
      req.log.warn(
        `Materia con id ${id} no encontrada al intentar obtener las unidades tematicas`
      );
      return res.status(404).json({
        error: "Materia no encontrada para mostrar las unidades tematicas",
      });
    }
    // Obtenemos las unidades asociadas a la materia
    const unidades = await UnidadTematica.findAll({
      attributes: ["id", "nombre", "descripcion"],
      where: { materia_id: id }, // Filtramos por el ID de la materia
      include: {
        model: Materia,
        attributes: ["codigo","nombre"],
      },
    });
    // Respondemos al usuario
    res.status(200).json(unidades);
  } catch (err) {
    const errorGetUn = new Error(
      `Ocurrió un problema al obtener las unidades tematicas - ${err.message}`
    );
    errorGetUn.stack = err.stack;
    next(errorGetUn);
  }
};

/* --------- getUnidadById function -------------- */
const getUnidadById = async (req, res, next) => {
  // Obtenemos el id de la unidad a obtener
  const { id } = req.params;
  try {
    // Obtenemos y verificamos la unidad
    const unidad = await UnidadTematica.findByPk(id, {
      attributes: ["nombre", "descripcion"],
      include: [
        {
          model: Materia,
          attributes: ["codigo", "nombre"],
        },
      ],
    });
    if (!unidad) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento acceder a una unidad no especificada`
      );
      return res.status(400).json({
        error: "No se encuentra ninguna unidad tematica con el id especificado",
      });
    }
    // Respondemos al usuario
    res.status(200).json(unidad);
  } catch (err) {
    const errorGetUniId = new Error(
      `Ocurrio un problema al obtener los datos de la unidad tematica especificada - ${err.message}`
    );
    errorGetUniId.stack = err.stack;
    next(errorGetUniId);
  }
};

/* --------- createUnidad function -------------- */
const createUnidad = async (req, res) => {
  // Obtenemos los datos de la unidad a crear
  const { nombre, descripcion, materia_id } = req.body;
  try {
    // Buscar la materia para la que se quiere crear la unidad
    const materia = await Materia.findByPk(materia_id);
    if (!materia) {
      return res
        .status(404)
        .json({ error: "La materia especificada no existe" });
    }
    // Verificar si la unidad temática ya está asociada a la materia
    const unidadExistente = await UnidadTematica.findOne({
      where: {
        nombre,
        materia_id: materia_id,
      },
    });

    if (unidadExistente) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento crear una unidad tematica ya registrada en la materia`
      );
      return res.status(400).json({
        error: `La unidad tematica ${nombre} ya se encuentra registrada en esta materia`,
      });
    }
    // Creamos la unidad
    await UnidadTematica.create({
      nombre: nombre.toUpperCase(),
      descripcion,
      materia_id,
    });
    // Respondemos al usuario
    res.status(200).json({ message: "Unidad tematica creada exitosamente" });
  } catch (err) {
    const errorCreateUni = new Error(
      `Ocurrio un problema al crear la unidad tematica - ${err.message}`
    );
    errorCreateUni.stack = err.stack;
    next(errorCreateUni);
  }
};

/* --------- updateUnidad function -------------- */
const updateUnidad = async (req, res, next) => {
  // Obtenemos el id de la unidad a actualizar
  const { id } = req.params;
  // Obtenemos los datos a actualizar
  const { nombre, descripcion, materia_id } = req.body;
  try {
    // Hacemos las verificaciones de la unidad en paralelo
    const [unidad, uniFound] = await Promise.all([
      UnidadTematica.findByPk(id),
      UnidadTematica.findOne({
        where: {
          nombre,
          materia_id: materia_id,
        },
      }),
    ]);
    // verificamos la unidad
    if (!unidad) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento acceder a una unidad tematica inexistente.`
      );
      return res.status(400).json({
        error: "No se encuentra ninguna unidad tematica con el id especificado",
      });
    }
    // Comprobamos que el nombre sea unico
    if (uniFound && unidad.nombre !== uniFound.nombre) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento usar un nombre de unidad tematica ya registrado en la materia`
      );
      return res.status(400).json({
        error: `El nombre de la unidad tematica ${nombre} ya se encuentra registrado en la materia`,
      });
    }
    // Actualizamos la unidad
    await unidad.update({
      nombre: nombre.toUpperCase(),
      descripcion,
      materia_id,
    });
    // Respondemos al usuario
    res
      .status(200)
      .json({ message: "Unidad Tematica actualizada correctamente" });
  } catch (err) {
    const errorUpdateUnidad = new Error(
      `Ocurrio un problema al actualizar la unidad tematica - ${err.message}`
    );
    errorUpdateUnidad.stack = err.stack;
    next(errorUpdateUnidad);
  }
};

/* --------- removeSubtema function -------------- */
const unlinkSubtema = async (req, res, next) => {
  // Obtenemos el identificador del subtema
  const { id } = req.params;
  try {
    // Obtenemos el subtema a desasociar
    const subtema = await Subtema.findByPk(id, {
      include: [UnidadTematica],
    });
    // verificamos el subtema
    if (!subtema) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento desvincular un subtema  inexsistente o no asociada a la unidad tematica especificada.`
      );
      return res.status(400).json({
        error: "No se encuentra ningun subtema con el id especificado",
      });
    }
    // Desvinculamos el subtema de su unidad tematica
    await subtema.setUnidades_Tematica(null);
    // Respondemos al usuario
    res.status(200).json({
      message: `Subtema ${subtema.nombre} desvinculado exitosamente`,
    });
  } catch (err) {
    const errorUnlinkSub = new Error(
      `Ocurrio un problema al desvincular la unidad tematica de su materia - ${err.message}`
    );
    errorUnlinkSub.stack = err.stack;
    next(errorUnlinkSub);
  }
};

/* --------- createUnidades function -------------- */
const createUnidades = async (req, res, next) => {
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
        "El archivo excel de unidades tematicas no puede estar vacio"
      );
    }
    // Verificamos que no haya duplicados en los encabezados
    let headers = Object.keys(dataExcel[0]);
    let headersSet = new Set(headers);
    if (headers.length !== headersSet.size) {
      res.status(400);
      throw new Error("No se permite el uso de encabezados duplicados");
    }
    // Verificamos que no haya duplicados en el conjunto de unidades cargadas
    // if (tieneDuplicadosMateria(dataExcel)) {
    //   res.status(400);
    //   throw new Error("No se permiten materias con codigos repetidos");
    // }
    // Obtenemos todos los docentes existentes

    //Inicializamos la transacción
    const result = await sequelize.transaction(async (t) => {
      // Arreglo que contiene los datos de las unidades tematicas nuevas
      const newUnidadesTematicas = [];
      // Registramos los datos de las unidades tematicas
      for (const itemFila of dataExcel) {
        // Validar las cabeceras del archivo
        if (!itemFila["codigo_materia"] || !itemFila["unidades_tematicas"]) {
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
        const unidadesTematicas = itemFila["unidades_tematicas"]
          .split(",")
          .map((unidad) => unidad.trim().toUpperCase());
        // Buscar si hay unidades temáticas iguales en la misma materia
        for (const unidad of unidadesTematicas) {
          const unidadExistente = await UnidadTematica.findOne({
            where: {
              nombre: unidad,
              materia_id: materiaId,
            },
          });

          if (!unidadExistente) {
            newUnidadesTematicas.push({
              nombre: unidad,
              materia_id: materiaId,
            });
          }
        }
      }
      // Registramos las unidades tematicas nuevas
      await UnidadTematica.bulkCreate(newUnidadesTematicas, {
        transaction: t,
      });

      return {
        newUnidadesL: newUnidadesTematicas.length,
      };
    });

    res.status(200).json({
      message: `Se han creado ${result.newUnidadesL} unidades tematicas nuevas satisfactoriamente al sistema`,
    });
  } catch (error) {
    const errorCargaUnidades = new Error(
      `Ocurrio un problema al intentar cargar el listado de unidades tematicas - ${error.message}`
    );
    errorCargaUnidades.stack = error.stack;
    next(errorCargaUnidades);
  }
};
/* --------- deleteUnidad function -------------- */
const deleteUnidad = async (req, res, next) => {
  // Obtenemos el identificador de la unidad
  const { id } = req.params;

  try {
    // Verificamos la existencia de la unidad
    const unidad = await UnidadTematica.findByPk(id, { include: Subtema });

    if (!unidad) {
      req.log.warn(
        "Intento de desvinculación de una unidad tematica inexistente"
      );
      return res
        .status(400)
        .json({ error: "No se encontro la unidad tematica especificada" });
    }
    // Buscar y eliminar todos los subtemas asociados a la unidad temática
    await Promise.all(
      unidad.Subtemas.map(async (subtema) => {
        await subtema.destroy();
      })
    );
    // Eliminar la unidad temática
    await unidad.destroy();
    res.status(200).json({
      message:
        "La unidad tematica ha sido desvinculada de la plataforma correctamente",
    });
  } catch (error) {
    const errorDelUni = new Error(
      `Ocurrio un problema al intentar desvincular la unidad tematica - ${error.message}`
    );
    errorDelUni.stack = error.stack;
    next(errorDelUni);
  }
};

const controller = {
  getUnidades,
  getUnidadesByMateria,
  getUnidadById,
  createUnidad,
  updateUnidad,
  unlinkSubtema, //no se va a usar en el front
  createUnidades,
  deleteUnidad,
};

export default controller;
