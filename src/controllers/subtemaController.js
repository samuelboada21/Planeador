import UnidadTematica from "../models/UnidadTematica.js";
import Subtema from "../models/Subtema.js";
import sequelize from "../database/db.js";

/* --------- getSubtemas function -------------- */
const getSubtemas = async (req, res, next) => {
  try {
    // Obtenemos las unidades
    const subtemas = await Subtema.findAll({
      attributes: ["id","nombre", "descripcion"],
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
const createSubtema = async (req, res) => {
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
  const { unidad_tematica_id, nombres } = req.body;

  try {
    // Buscar la unidad para la que se quiere crear el subtmea
    const unidad = await UnidadTematica.findByPk(unidad_tematica_id);
    if (!unidad) {
      return res
        .status(404)
        .json({ error: "La unidad temática especificada no existe" });
    }
    //iteramos los subtemas
    const subtemas = [];
    for (const nombre of nombres) {
      const subtemaExistente = await Subtema.findOne({
        where: {
          nombre: nombre.trim().toLowerCase(),
          unidad_tematica_id: unidad_tematica_id,
        },
      });

      if (!subtemaExistente) {
        subtemas.push({
          nombre: nombre.trim().toLowerCase(),
          unidad_tematica_id: unidad_tematica_id,
        });
      }
    }
    // Creamos el subtema
    await Subtema.bulkCreate(subtemas);
    // Respondemos al usuario
    res.status(200).json({ message: "Subtemas creados exitosamente" });
  } catch (err) {
    const errorCreateSub = new Error(
      `Ocurrio un problema al crear los subtemas - ${err.message}`
    );
    errorCreateSub.stack = err.stack;
    next(errorCreateSub);
  }
};

const controller = {
  getSubtemas,
  getSubtemaById,
  createSubtema,
  updateSubtema,
  deleteSubtema,
  createSubtemas
};

export default controller;
