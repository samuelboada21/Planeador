import Categoria from "../models/Categoria.js";
import Competencia from "../models/Competencia.js";
import Resultado_Aprendizaje from "../models/ResultadoAprendizaje.js";

/* --------- getCompetencias function -------------- */
const getCompetencias = async (req, res, next) => {
  // Estado
  const state = req.query.estado || true;
  try {
    // Obtenemos las competencias
    const competencias = await Competencia.findAll({
      where: {
        estado: state,
      },
      attributes: ["id","codigo", "nombre", "estado"],
      include: {
        model: Resultado_Aprendizaje,
        attributes: ["codigo"],
      },
    });
    // Respondemos al usuario
    res.status(200).json(competencias);
  } catch (err) {
    const errorGetComp = new Error(
      `Ocurrio un problema al obtener las competencias - ${err.message}`
    );
    errorGetComp.stack = err.stack;
    next(errorGetComp);
  }
};

/* --------- getCompetenciaById function -------------- */
const getCompetenciaById = async (req, res, next) => {
  // Obtenemos el id de la competencia a obtener
  const { id } = req.params;
  try {
    // Obtenemos y verificamos la competencia
    const competencia = await Competencia.findByPk(id, {
      attributes: ["codigo", "nombre", "descripcion", "estado"],
      include: {
        model: Resultado_Aprendizaje,
        attributes: ["codigo"],
      },
    });
    if (!competencia) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento acceder a una competencia no especificada`
      );
      return res.status(400).json({
        error: "No se encuentra ninguna competencia con el id especificado",
      });
    }
    // Respondemos al usuario
    res.status(200).json(competencia);
  } catch (err) {
    const errorGetCompId = new Error(
      `Ocurrio un problema al obtener los datos de la competencia especificada - ${err.message}`
    );
    errorGetCompId.stack = err.stack;
    next(errorGetCompId);
  }
};

const normalizeText = (text) => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};
/* --------- createCompetencia function -------------- */
const createCompetencia = async (req, res, next) => {
  // Obtenemos los datos de la competencia a crear
  const { nombre, descripcion, categoria_id } = req.body;
  try {
    const [competenciaExist, categoria_exist] = await Promise.all([
      Competencia.findOne({
        where: {
          nombre,
        },
      }),
      Categoria.findByPk(categoria_id),
    ]);
    // Comprobamos que el nombre de la competencia sea unico
    if (competenciaExist)
      return res.status(400).json({
        error: `El nombre de la competencia ${nombre} ya se encuentra registrado`,
      });
    // Comprobamos que el id de la categoria corresponda a uno válido
    if (!categoria_exist) {
      req.log.warn(
        `Intento de asociacion de una categoria inexistente a una nueva competencia por parte del usuario con id ${req.user.id}`
      );
      return res.status(400).json({
        error:
          "El id de categoria proporcionado no corresponde con ninguna existente",
      });
    }
    //código de la competencia automático
    const categoriaNormalized = normalizeText(categoria_exist.nombre);
    let codigoPrefix = "";
    if (categoriaNormalized === "competencias genericas") {
      codigoPrefix = "CG";
    } else if (categoriaNormalized === "competencias especificas") {
      codigoPrefix = "CE";
    } else {
      return res.status(400).json({ error: "Tipo de categoría no valido" });
    }
    // Consultamos la base de datos para obtener la cantidad de competencias asociadas a esta categoría
    const cantidadCompetencias = await Competencia.count({
      where: { categoria_id },
    });
    // Construimos el código de la competencia
    const codigo = codigoPrefix + (cantidadCompetencias + 1);
    // Creamos la competencia
    await Competencia.create({
      codigo,
      nombre: nombre.toUpperCase(),
      descripcion,
      categoria_id,
    });
    // Respondemos al usuario
    res.status(200).json({ message: "Competencia creada exitosamente" });
  } catch (err) {
    const errorCreateComp = new Error(
      `Ocurrio un problema al crear la competencia - ${err.message}`
    );
    errorCreateComp.stack = err.stack;
    next(errorCreateComp);
  }
};

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
      return res.status(400).json({
        error: "No se encuentra ninguna competencia con el id especificado",
      });
    }
    // Comprobamos que el nombre sea unico
    if (competenciaExist && competenciaExist.nombre !== competencia.nombre)
      return res.status(400).json({
        error: `El nombre de la competencia ${nombre} ya se encuentra registrado`,
      });
    // Comprobamos que el id de la categoria corresponda a uno válido
    if (!categoria_exist) {
      req.log.warn(
        `Intento de asociacion de una categoria inexistente a una nueva competencia por parte del usuario con id ${req.user.id}`
      );
      return res.status(400).json({
        error:
          "El id de la categoria proporcionado no corresponde con ninguna existente",
      });
    }
    //código de la competencia automático
    const categoriaNormalized = normalizeText(categoria_exist.nombre);
    let codigoPrefix = "";
    if (categoriaNormalized === "competencias genericas") {
      codigoPrefix = "CG";
    } else if (categoriaNormalized === "competencias especificas") {
      codigoPrefix = "CE";
    } else {
      return res.status(400).json({ error: "Tipo de categoría no valido" });
    }
    // Consultamos la base de datos para obtener la cantidad de competencias asociadas a esta categoría
    const cantidadCompetencias = await Competencia.count({
      where: { categoria_id },
    });
    // Construimos el código de la competencia
    const codigo = codigoPrefix + (cantidadCompetencias);
    // Actualizamos la competencia
    await competencia.update({
      codigo,
      nombre: nombre.toUpperCase(),
      descripcion,
      estado,
      categoria_id,
    });
    // ajustados el estado del ra para que coincida con su competencia
    await Resultado_Aprendizaje.update(
      {
        estado: competencia.estado,
      },
      {
        where: {
          competencia_id: competencia.id,
        },
      }
    );
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
      return res.status(400).json({
        error:
          "No se encuentra ningun resultado de aprendizaje con el id especificado",
      });
    }
    // Desvinculamos el resultado de su competencia
    await resultado.setCompetencia(null);
    // Respondemos al usuario
    res.status(200).json({
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
