import UnidadTematica from "../models/UnidadTematica.js";
import Subtema from "../models/Subtema.js";
import sequelize from "../database/db.js";
import XLSX from "xlsx";

/* --------- getSubtemas function -------------- */
const getSubtemas = async (req, res, next) => {
  try {
    // Obtenemos las unidades
    const subtemas = await Subtema.findAll({
      attributes: ["id", "nombre", "descripcion"],
      include: {
        model: UnidadTematica,
        attributes: ["nombre"],
      },
    });
    // Respondemos al usuario
    res.status(200).json(subtemas);
  } catch (err) {
    const errorGetSub = new Error(
      `Ocurrio un problema al obtener los subtemas - ${err.message}`
    );
    errorGetSub.stack = err.stack;
    next(errorGetSub);
  }
};

/* --------- getSubtemasByUnidad function -------------- */
const getSubtemasByUnidad = async (req, res, next) => {
  const { id } = req.params; // Obtenemos el ID de la unidad temática
  try {
    // Verificamos si la unidad temática existe
    const unidadTematica = await UnidadTematica.findByPk(id);
    if (!unidadTematica) {
      req.log.warn(
        `Unidad temática con id ${id} no encontrada al intentar obtener subtemas`
      );
      return res.status(404).json({
        error: "Unidad temática no encontrada para mostrar los subtemas",
      });
    }
    // Obtenemos los subtemas asociados a la unidad temática
    const subtemas = await Subtema.findAll({
      attributes: ["id", "nombre", "descripcion"],
      where: { unidad_tematica_id: id }, // Filtramos por el ID de la unidad temática
      include: {
        model: UnidadTematica,
        attributes: ["nombre"],
      },
    });
    // Respondemos al usuario
    res.status(200).json(subtemas);
  } catch (err) {
    const errorGetSub = new Error(
      `Ocurrió un problema al obtener los subtemas - ${err.message}`
    );
    errorGetSub.stack = err.stack;
    next(errorGetSub);
  }
};

/* --------- getSubtemaById function -------------- */
const getSubtemaById = async (req, res, next) => {
  // Obtenemos el id del subtema a obtener
  const { id } = req.params;
  try {
    // Obtenemos y verificamos el subtema
    const subtema = await Subtema.findByPk(id, {
      attributes: ["nombre", "descripcion"],
      include: [
        {
          model: UnidadTematica,
          attributes: ["nombre"],
        },
      ],
    });
    if (!subtema) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento acceder a un subtema no especificado`
      );
      return res.status(400).json({
        error: "No se encuentra ningun subtema con el id especificado",
      });
    }
    // Respondemos al usuario
    res.status(200).json(subtema);
  } catch (err) {
    const errorGetSubId = new Error(
      `Ocurrio un problema al obtener los datos del subtmea especificado - ${err.message}`
    );
    errorGetSubId.stack = err.stack;
    next(errorGetSubId);
  }
};

/* --------- createSubtema function -------------- */
const createSubtema = async (req, res, next) => {
  // Obtenemos los datos del subtema a crear
  const { nombre, descripcion, unidad_tematica_id } = req.body;
  try {
    // Buscar la unidad para la que se quiere crear el subtmea
    const unidad = await UnidadTematica.findByPk(unidad_tematica_id);
    if (!unidad) {
      return res
        .status(404)
        .json({ error: "La unidad temática especificada no existe" });
    }
    // Verificar si el subtema ya está asociado a la unidad temática
    const subtemaExistente = await Subtema.findOne({
      where: {
        nombre,
        unidad_tematica_id: unidad_tematica_id,
      },
    });
    if (subtemaExistente) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento crear un subtema ya registrado en la unidad`
      );
      return res.status(400).json({
        error: `El subtema ${nombre} ya se encuentra registrado en esta unidad temática`,
      });
    }
    // Creamos el subtema
    await Subtema.create({
      nombre: nombre.toLowerCase(),
      descripcion,
      unidad_tematica_id,
    });
    // Respondemos al usuario
    res.status(200).json({ message: "Subtema creado exitosamente" });
  } catch (err) {
    const errorCreateSub = new Error(
      `Ocurrio un problema al crear el subtema - ${err.message}`
    );
    errorCreateSub.stack = err.stack;
    next(errorCreateSub);
  }
};

/* --------- updateSubtema function -------------- */
const updateSubtema = async (req, res, next) => {
  // Obtenemos el id del subtema a actualizar
  const { id } = req.params;
  // Obtenemos los datos a actualizar
  const { nombre, descripcion, unidad_tematica_id } = req.body;
  try {
    // Buscar la unidad para la que se quiere actualizar el subtmea
    const unidad = await UnidadTematica.findByPk(unidad_tematica_id);
    if (!unidad) {
      return res
        .status(404)
        .json({ error: "La unidad temática especificada no existe" });
    }
    // Hacemos las verificaciones del subtema en paralelo
    const [subtema, subFound] = await Promise.all([
      Subtema.findByPk(id),
      Subtema.findOne({
        where: {
          nombre,
          unidad_tematica_id: unidad_tematica_id,
        },
      }),
    ]);
    // verificamos el subtema
    if (!subtema) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento acceder a un subtema inexistente.`
      );
      return res.status(400).json({
        error: "No se encuentra ningun subtema con el id especificado",
      });
    }
    // Comprobamos que el nombre sea unico
    if (subFound && subtema.nombre !== subFound.nombre) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento usar un nombre de subtema ya registrado en la unidad tematica`
      );
      return res.status(400).json({
        error: `El nombre del subtema ${nombre} ya se encuentra registrado en la unidad tematica`,
      });
    }
    // Actualizamos la unidad
    await subtema.update({
      nombre: nombre.toLowerCase(),
      descripcion,
      unidad_tematica_id,
    });
    // Respondemos al usuario
    res.status(200).json({ message: "Subtema actualizado correctamente" });
  } catch (err) {
    const errorUpdateSubtema = new Error(
      `Ocurrio un problema al actualizar el subtema - ${err.message}`
    );
    errorUpdateSubtema.stack = err.stack;
    next(errorUpdateSubtema);
  }
};

/* --------- deleteSubtema function -------------- */
const deleteSubtema = async (req, res, next) => {
  // Obtenemos el identificador del subtema
  const { id } = req.params;

  try {
    // Verificamos la existencia del subtema
    const subtema = await Subtema.findByPk(id);

    if (!subtema) {
      req.log.warn("Intento de desvinculación de un subtema inexistente");
      return res
        .status(400)
        .json({ error: "No se encontro el subtema especificado" });
    }
    // Eliminar el subtema
    await subtema.destroy();
    res.status(200).json({
      message: "El subtema ha sido desvinculado de la plataforma correctamente",
    });
  } catch (error) {
    const errorDelSub = new Error(
      `Ocurrio un problema al intentar desvincular el subtema - ${error.message}`
    );
    errorDelSub.stack = error.stack;
    next(errorDelSub);
  }
};

/* --------- createSubtemas function -------------- */
const createSubtemas = async (req, res, next) => {
  const {id} = req.params; //Id de la materia
  console.error("ID", id)
  try {
    // obtenemos el archivo excel
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
      throw new Error("El archivo excel de Subtemas no puede estar vacío");
    }
    // Verificamos que no haya duplicados en los encabezados
    let headers = Object.keys(dataExcel[0]);
    let headersSet = new Set(headers);
    if (headers.length !== headersSet.size) {
      res.status(400);
      throw new Error("No se permite el uso de encabezados duplicados");
    }
    // Inicializamos la transacción
    const result = await sequelize.transaction(async (t) => {
      // Arreglo que contiene los datos de los subtemas nuevos
      const newSubtemas = [];
      // Registramos los datos de los subtemas
      for (const itemFila of dataExcel) {
        // Validar las cabeceras del archivo
        if (!itemFila["unidad_tematica"] || !itemFila["subtemas"]) {
          res.status(400);
          throw new Error("Formato de archivo no correspondiente");
        }

        const unidadTematicaNombre = itemFila["unidad_tematica"]
          .trim()
          .toUpperCase();
        const subtemas = itemFila["subtemas"]
          .split(",")
          .map((subtema) => subtema.trim().toLowerCase());

        // Validamos que la unidad tematica exista dentro de esa materia
        const unidadTematica = await UnidadTematica.findOne({
          where: {
            nombre: unidadTematicaNombre,
            materia_id: id,
          },
          transaction: t,
        });

        if (!unidadTematica) {
          res.status(400);
          throw new Error(
            `La unidad temática "${unidadTematicaNombre}" no existe en la materia`
          );
        }

        const unidadTematicaId = unidadTematica.id;

        // Buscar si hay subtemas iguales en la misma unidad tematica
        for (const subtemaNombre of subtemas) {
          const subtemaExistente = await Subtema.findOne({
            where: {
              nombre: subtemaNombre,
              unidad_tematica_id: unidadTematicaId,
            },
            transaction: t,
          });

          if (!subtemaExistente) {
            newSubtemas.push({
              nombre: subtemaNombre,
              unidad_tematica_id: unidadTematicaId,
            });
          }
        }
      }

      // Registramos los subtemas nuevos
      await Subtema.bulkCreate(newSubtemas, {
        transaction: t,
      });

      return {
        newSubtemasL: newSubtemas.length,
      };
    });

    res.status(200).json({
      message: `Se han creado ${result.newSubtemasL} subtemas nuevos satisfactoriamente al sistema`,
    });
  } catch (error) {
    const errorCargaSubtemas = new Error(
      `Ocurrio un problema al intentar cargar el listado de subtemas - ${error.message}`
    );
    errorCargaSubtemas.stack = error.stack;
    next(errorCargaSubtemas);
  }
};

const controller = {
  getSubtemas,
  getSubtemasByUnidad,
  getSubtemaById,
  createSubtema,
  updateSubtema,
  deleteSubtema,
  createSubtemas,
};

export default controller;
