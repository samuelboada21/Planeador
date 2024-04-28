import Resultado_Aprendizaje from "../models/ResultadoAprendizaje.js";
import Competencia from "../models/Competencia.js";
import Sequelize from "../database/db.js";
import Resultado_Aprendizaje from "../models/ResultadoAprendizaje.js";

/* --------- getResultados function -------------- */
const getResultados = async (req, res, next) => {
  // Estado
  const state = req.query.estado || true;
  try {
    // Obtenemos los resultados
    const resultados = await Resultado_Aprendizaje.findAll({
      where: {
        estado: state,
      },
      attributes: ["codigo", "descripcion", "estado"],
      include: {
        model: Competencia,
        attributes: ["nombre"],
      },
    });
    // Respondemos al usuario
    res.status(200).json(resultados);
  } catch (err) {
    const errorGetresult = new Error(
      `Ocurrio un problema al obtener los resultados de aprendizaje - ${err.message}`
    );
    errorGetresult.stack = err.stack;
    next(errorGetresult);
  }
};

/* --------- getResultadoById function -------------- */
const getResultadoById = async (req, res, next) => {
  // Obtenemos el id del RA a obtener
  const { id } = req.params;
  try {
    // Obtenemos y verificamos el RA
    const resultado = await Resultado_Aprendizaje.findByPk(id, {
      attributes: ["codigo", "descripcion", "estado"],
      include: {
        model: Competencia,
        attributes: ["nombre"],
      },
    });
    if (!resultado) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento acceder a un RA no especificado`
      );
      return res
        .status(400)
        .json({
          error: "No se encuentra ningun resultado de aprendizaje con el id especificado",
        });
    }
    // Respondemos al usuario
    res.status(200).json(resultado);
  } catch (err) {
    const errorGetResId = new Error(
      `Ocurrio un problema al obtener los datos del resultado de aprendizaje especificado - ${err.message}`
    );
    errorGetResId.stack = err.stack;
    next(errorGetResId);
  }
};

const normalizeText = (text) => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};
/* --------- createResultado function -------------- */
const createResultado = async (req, res, next) => {
  // Obtenemos los datos del RA a crear
  const {descripcion, competencia_id, cantidadRA } = req.body;
  try {
    const [resultadoExist, competencia_Exist] = await Promise.all([
      Resultado_Aprendizaje.findOne({
        where: {
          descripcion,
        },
      }),
      Competencia.findByPk(competencia_id),
      Resultado_Aprendizaje.count(),
    ]);
    // Comprobamos que la descripción sea única sea unico
    if (resultadoExist)
      return res
        .status(400)
        .json({
          error: `La descripcion del resultado de aprendizaje ya se encuentra registrado`,
        });
    // Comprobamos que el id de la competencia corresponda a uno válido
    if (!competencia_Exist) {
      req.log.warn(
        `Intento de asociacion de una competencia inexistente a un nuevo RA por parte del usuario con id ${req.user.id}`
      );
      return res
        .status(400)
        .json({
          error:
            "El id de competencia proporcionado no corresponde con ninguna existente",
        });
    }
    // Obtener la categoría asociada a la competencia
    const categoria = await competencia_Exist.getCategoria();
    if (!categoria) {
      return res
        .status(400)
        .json({ error: "No se encontró la categoría asociada a la competencia" });
    }
    // Normalizar el nombre de la categoría
    const categoriaNormalized = normalizeText(categoria.nombre);
    // Definir el prefijo del código según la categoría
    let codigoPrefix = "";
    if (categoriaNormalized === "competencias genericas") {
      codigoPrefix = "RAG";
    } else if (categoriaNormalized === "competencias especificas") {
      codigoPrefix = "RAE";
    } else {
      return res.status(400).json({ error: "Tipo de categoría no válido" });
    }
    // Construir el código del RA
    const codigo = codigoPrefix + (cantidadRA + 1);
    // Creamos la competencia
    await Resultado_Aprendizaje.create({
      codigo,
      descripcion: descripcion.toLowerCase(),
      competencia_id,
    });
    // Respondemos al usuario
    res.status(200).json({ message: "Resultado de Aprendizaje creado exitosamente" });
  } catch (err) {
    const errorCreateRA = new Error(
      `Ocurrio un problema al crear el RA - ${err.message}`
    );
    errorCreateRA.stack = err.stack;
    next(errorCreateRA);
  }
};
/**
 * 
**
**
*
*
*
*
*

*
**
 */

/* --------- updateCompetencia function -------------- */
const updateCompetencia = async (req, res, next) => {
  // Obtenemos el id de la categoria a actualizar
  const { id } = req.params;
  // Obtenemos los datos a actualizar
  const { nombre, descripcion, estado, categoria_id } = req.body;
  try {
    const [competencia, competenciaExist, categoria_exist] = await Promise.all([
      Competencia.findByPk(id),
      Competencia.findOne({
        where: {
          nombre,
        },
      }),
      Categoria.findByPk(categoria_id),
    ]);
    // Verificamos la competencia
    if (!competencia) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento acceder a una competencia no especificada`
      );
      return res
        .status(400)
        .json({
          error: "No se encuentra ninguna competencia con el id especificado",
        });
    }
    // Comprobamos que el nombre sea unico
    if (competenciaExist && competenciaExist.nombre !== competencia.nombre)
      return res
        .status(400)
        .json({
          error: `El nombre de la competencia ${nombre} ya se encuentra registrado`,
        });
    // Comprobamos que el id de la categoria corresponda a uno válido
    if (!categoria_exist) {
      req.log.warn(
        `Intento de asociacion de una categoria inexistente a una nueva competencia por parte del usuario con id ${req.user.id}`
      );
      return res
        .status(400)
        .json({
          error:
            "El id de la categoria proporcionado no corresponde con ninguna existente",
        });
    }
    // Actualizamos la competencia
    await competencia.update({
      nombre: nombre.toUpperCase(),
      descripcion,
      estado,
      categoria_id,
    });
    // Si la competencia es desactivada, deshabilitamos todos los resultados de aprendizaje asociadas a esta
    if (!competencia.estado) {
      await Resultado_Aprendizaje.update(
        {
          estado: false,
        },
        {
          where: {
            competencia_id: competencia.id,
          },
        }
      );
    }
    // Respondemos al usuario
    res.status(200).json({ message: "Competencia actualizada correctamente" });
  } catch (err) {
    const errorUpdateComp = new Error(
      `Ocurrio un problema al actualizar la competencia - ${err.message}`
    );
    errorUpdateComp.stack = err.stack;
    next(errorUpdateComp);
  }
};

/* --------- removeResultado function -------------- */
const unlinkResultado = async (req, res, next) => {
  // Obtenemos el identificador del resultado de aprendizaje
  const { id } = req.params;
  try {
    console.log(id);
    // Obtenemos el resultado a desasociar
    const resultado = await Resultado_Aprendizaje.findByPk(id, {
      include: [Competencia],
    });
    // verificamos el RA
    if (!resultado) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento desvincular un resultado de aprendizaje inexsistente o no asociada a la competencia especificada.`
      );
      return res
        .status(400)
        .json({
          error:
            "No se encuentra ningun resultado de aprendizaje con el id especificado",
        });
    }
    // Desvinculamos el resultado de su competencia
    await resultado.setCompetencia(null);
    // Respondemos al usuario
    res
      .status(200)
      .json({
        message: `Resultado de aprendizaje ${resultado.codigo} desvinculado exitosamente`,
      });
  } catch (err) {
    const errorUnlinkRA = new Error(
      `Ocurrio un problema al desvincular el RA de su competencia - ${err.message}`
    );
    errorUnlinkRA.stack = err.stack;
    next(errorUnlinkRA);
  }
};
const controller = {
  getCompetencias,
  getCompetenciaById,
  createCompetencia,
  updateCompetencia,
  unlinkResultado,
};
export default controller;
