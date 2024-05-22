import TipoEvidencia from "../models/TipoEvidencia.js";
import RaCurso from "../models/RaCurso.js";
import XLSX from "xlsx";
import sequelize from "../database/db.js";

/* --------- getTipoEvidencias function -------------- */
const getTipoEvidencias = async (req, res, next) => {
  try {
    // Obtenemos los tipo de evidencia
    const tipoEvidencias = await TipoEvidencia.findAll({
      attributes: ["id", "nombre"],
      include: {
        model: RaCurso,
        attributes: ["id", "nombre"],
      },
    });
    // Respondemos al usuario
    res.status(200).json(tipoEvidencias);
  } catch (err) {
    const errorGetTipo = new Error(
      `Ocurrio un problema al obtener los tipo de evidencias - ${err.message}`
    );
    errorGetTipo.stack = err.stack;
    next(errorGetTipo);
  }
};

/* --------- getTipoByRaCurso function -------------- */
const getTipoByRaCurso = async (req, res, next) => {
  const { id } = req.params; // Obtenemos el ID del RaCurso
  try {
    // Verificamos si el RaCurso existe
    const raCurso = await RaCurso.findByPk(id);
    if (!raCurso) {
      req.log.warn(
        `Resultado de aprendizaje del curso con id ${id} no encontrado al intentar obtener los tipos de evidencia`
      );
      return res.status(404).json({
        error: "Resultado de aprendizaje del curso no encontrado para mostrar los tipos de evidencia",
      });
    }
    // Obtenemos los tipos de evidencia asociados al RaCurso
    const tipos = await TipoEvidencia.findAll({
      attributes: ["id", "nombre"],
      where: { ra_curso_id: id }, // Filtramos por el ID del RaCurso
      include: {
        model: RaCurso,
        attributes: ["nombre"],
      },
    });
    // Respondemos al usuario
    res.status(200).json(tipos);
  } catch (err) {
    const errorGetTip = new Error(
      `Ocurrió un problema al obtener los tipos de evidencia - ${err.message}`
    );
    errorGetTip.stack = err.stack;
    next(errorGetTip);
  }
};


/* --------- getTipoEvidenciaById function -------------- */
const getTipoEvidenciaById = async (req, res, next) => {
  // Obtenemos el id del tipo de evidencia a obtener
  const { id } = req.params;
  try {
    // Obtenemos y verificamos el tipo de evidencia 
    const tipoEvidencia = await TipoEvidencia.findByPk(id, {
      attributes: ["nombre"],
      include: [
        {
          model: RaCurso,
          attributes: ["nombre"],
        },
      ],
    });
    if (!tipoEvidencia) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento acceder a un tipo de evidencia no especificado`
      );
      return res.status(400).json({
        error:
          "No se encuentra ningun tipo de evidencia con el id especificado",
      });
    }
    // Respondemos al usuario
    res.status(200).json(tipoEvidencia);
  } catch (err) {
    const errorGetTipoId = new Error(
      `Ocurrio un problema al obtener los datos del tipo de evidencia especificado - ${err.message}`
    );
    errorGetTipoId.stack = err.stack;
    next(errorGetTipoId);
  }
};

/* --------- createTipoEvidencia function -------------- */
const createTipoEvidencia = async (req, res) => {
  // Obtenemos los datos del tipo de evidencia a crear
  const { nombre, ra_curso_id } = req.body;
  try {
    // Buscar el ra curso para la que se quiere crear el tipo de evidencia
    const raCurso = await RaCurso.findByPk(ra_curso_id);
    if (!raCurso) {
      return res
        .status(404)
        .json({ error: "El resultado de aprendizaje del curso especificado no existe" });
    }
    // Verificar si el tipo de evidencia ya está asociada al ra curso
    const tipoExistente = await TipoEvidencia.findOne({
      where: {
        nombre,
        ra_curso_id: ra_curso_id,
      },
    });

    if (tipoExistente) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento crear un tipo de evidencia ya registrado en el ra curso`
      );
      return res.status(400).json({
        error: `El tipo de evidencia ${nombre} ya se encuentra registrado en este ra curso`,
      });
    }
    // Creamos el tipo de evidencia
    await TipoEvidencia.create({
      nombre: nombre.toLowerCase(),
      ra_curso_id,
    });
    // Respondemos al usuario
    res
      .status(200)
      .json({
        message: "Tipo de evidencia creado exitosamente",
      });
  } catch (err) {
    const errorCreateTipo = new Error(
      `Ocurrio un problema al crear el tipo de evidencia - ${err.message}`
    );
    errorCreateTipo.stack = err.stack;
    next(errorCreateTipo);
  }
};

/* --------- updateTipoEvidencia function -------------- */
const updateTipoEvidencia = async (req, res, next) => {
  // Obtenemos el id del tipo de evidencia a actualizar
  const { id } = req.params;
  // Obtenemos los datos a actualizar
  const { nombre, ra_curso_id } = req.body;
  try {
    // Hacemos las verificaciones del tipo de evidencia en paralelo
    const [tipoEvidencia, tipoEvidenciaFound] = await Promise.all([
      TipoEvidencia.findByPk(id),
      TipoEvidencia.findOne({
        where: {
          nombre,
          ra_curso_id: ra_curso_id,
        },
      }),
    ]);
    // verificamos el tipo de evidencia
    if (!tipoEvidencia) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento acceder a un tipo de evidencia inexistente.`
      );
      return res.status(400).json({
        error:
          "No se encuentra ningun tipo de evidencia con el id especificado",
      });
    }
    // Comprobamos que el nombre sea unico
    if (tipoEvidenciaFound && tipoEvidencia.nombre !== tipoEvidenciaFound.nombre) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento usar un tipo de evidencia ya registrado en el ra curso`
      );
      return res.status(400).json({
        error: `El tipo de evidencia de curso ${nombre} ya se encuentra registrado en el ra curso`,
      });
    }
    // Actualizamos el ra curso
    await tipoEvidencia.update({
      nombre: nombre.toLowerCase(),
      ra_curso_id,
    });
    // Respondemos al usuario
    res
      .status(200)
      .json({
        message: "tipo de evidencia actualizado correctamente",
      });
  } catch (err) {
    const errorUpdateTipo = new Error(
      `Ocurrio un problema al actualizar el tipo de evidencia - ${err.message}`
    );
    errorUpdateTipo.stack = err.stack;
    next(errorUpdateTipo);
  }
};


/* --------- deleteTipoEvidencia function -------------- */
const deleteTipoEvidencia = async (req, res, next) => {
  // Obtenemos el identificador del tipo de evidencia
  const { id } = req.params;
  try {
    // Verificamos la existencia del tipo de evidencia
    const tipoEvidencia = await TipoEvidencia.findByPk(id);
    if (!tipoEvidencia) {
      req.log.warn("Intento de desvinculación de un tipo de evidencia inexistente");
      return res
        .status(400)
        .json({
          error:
            "No se encontro el tipo de evidencia especificado",
        });
    }
    // Eliminar el tipo de evidencia
    await tipoEvidencia.destroy();
    res.status(200).json({
      message:
        "El tipo de evidencia ha sido desvinculado de la plataforma correctamente",
    });
  } catch (error) {
    const errorDelTipo = new Error(
      `Ocurrio un problema al intentar desvincular el tipo de evidencia - ${error.message}`
    );
    errorDelTipo.stack = error.stack;
    next(errorDelTipo);
  }
};

const controller = {
  getTipoEvidencias,
  getTipoByRaCurso,
  getTipoEvidenciaById,
  createTipoEvidencia,
  updateTipoEvidencia,
  deleteTipoEvidencia,
};

export default controller;
