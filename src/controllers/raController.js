import Resultado_Aprendizaje from "../models/ResultadoAprendizaje.js";
import Competencia from "../models/Competencia.js";

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
  const {descripcion, competencia_id} = req.body;
  try {
    const [resultadoExist, competencia_Exist, cantidadRA] = await Promise.all([
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

/* --------- updateResultado function -------------- */
const updateResultado = async (req, res, next) => {
  // Obtenemos el id del RA a actualizar
  const { id } = req.params;
  // Obtenemos los datos a actualizar
  const { descripcion, estado, competencia_id } = req.body;
  try {
    const [resultado, resultadoExist, competencia_exist, cantidadRA] = await Promise.all([
      Resultado_Aprendizaje.findByPk(id),
      Resultado_Aprendizaje.findOne({
        where: {
          descripcion,
        },
      }),
      Competencia.findByPk(competencia_id),
      Resultado_Aprendizaje.count(),
    ]);
    // Verificamos el RA
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
    // Comprobamos que el nombre sea unico
    if (resultadoExist && resultadoExist.descripcion !== resultado.descripcion)
      return res
        .status(400)
        .json({
          error: `La descripcion ya se encuentra registrada`,
        });
    // Comprobamos que el id de la competencia corresponda a uno válido
    if (!competencia_exist) {
      req.log.warn(
        `Intento de asociacion de una competencia inexistente a un nuevo RA por parte del usuario con id ${req.user.id}`
      );
      return res
        .status(400)
        .json({
          error:
            "El id de la competencia proporcionado no corresponde con ninguna existente",
        });
    }
    // Obtener la categoría asociada a la competencia
    const categoria = await competencia_exist.getCategoria();
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
     const codigo = codigoPrefix + (cantidadRA);
    // Actualizamos el RA
    await resultado.update({
      codigo,
      descripcion: descripcion.toLowerCase(),
      estado,
      competencia_id,
    });
    // Respondemos al usuario
    res.status(200).json({ message: "Resultado de aprendizaje actualizado correctamente" });
  } catch (err) {
    const errorUpdateRes= new Error(
      `Ocurrio un problema al actualizar el resultado de aprendizaje - ${err.message}`
    );
    errorUpdateRes.stack = err.stack;
    next(errorUpdateRes);
  }
};

/* --------- removeResultado function -------------- */
const deleteResultado = async (req, res, next) => {
  // Obtenemos el identificador del RA
  const { id } = req.params;
  try {
    // Verificamos la existencia del RA
    const resultado = await Resultado_Aprendizaje.findByPk(id);
    if (!resultado) {
      req.log.warn("Intento de desvinculación de un RA inexistente");
      return res
        .status(400)
        .json({ error: "No se encontro el resultado de aprendizaje especificado" });
    }
    // Eliminamos el RA
    await resultado.destroy();
    //respondemos al usuario
    res.status(200).json({
      message: "El resultado de aprendizaje ha sido eliminado correctamente",
    });
  } catch (error) {
    const errorDelRes= new Error(
      `Ocurrio un problema al intentar elimminar el resultado de aprendizaje - ${error.message}`
    );
    errorDelRes.stack = error.stack;
    next(errorDelRes);
  }
};
const controller = {
  getResultados,
  getResultadoById,
  createResultado,
  updateResultado,
  deleteResultado,
};
export default controller;
