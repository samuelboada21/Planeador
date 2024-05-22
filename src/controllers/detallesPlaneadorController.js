import Materia from "../models/Materia.js";
import Usuario from "../models/Usuario.js";
import Planeador from "../models/Planeador.js";
import Detalles from "../models/DetallesPlaneador.js";

/* --------- getPlaneadorDetalles function -------------- */
const getPlaneadorDetalles = async (req, res, next) => {
  try {
    // Obtenemos todos los detalles(filas) de un planeador
    const planeadores = await Planeador.findAll({
      attributes: ["id", "nombre", "area_formacion"],
      include: [
        {
          model: Usuario,
          attributes: ["id", "codigo", "nombre"],
        },
        {
          model: Materia,
          attributes: ["id", "codigo", "nombre"],
        },
      ],
    });
    // Respondemos al usuario
    res.status(200).json(planeadores);
  } catch (err) {
    const errorGetPlan = new Error(
      `Ocurrio un problema al obtener los planeadores - ${err.message}`
    );
    errorGetPlan.stack = err.stack;
    next(errorGetPlan);
  }
};

/* --------- getPlaneadorById function -------------- */
const getPlaneadorById = async (req, res, next) => {
  // Obtenemos el id del pleandor a obtener
  const { id } = req.params;
  try {
    // Obtenemos y verificamos el planeador
    const planeador = await Planeador.findByPk(id, {
      attributes: ["nombre", "area_formacion"],
      include: [
        {
          model: Usuario,
          attributes: ["id", "codigo", "nombre"],
        },
        {
          model: Materia,
          attributes: ["id", "codigo", "nombre"],
        },
        {
          model: Detalles,
          attributes: ["id"],
        },
      ],
    });
    if (!planeador) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento acceder a un planeador no especificado`
      );
      return res.status(400).json({
        error: "No se encuentra ningun planeador con el id especificado",
      });
    }
    // Respondemos al usuario
    res.status(200).json(planeador);
  } catch (err) {
    const errorGetPlanId = new Error(
      `Ocurrio un problema al obtener los datos del planeador especificado - ${err.message}`
    );
    errorGetPlanId.stack = err.stack;
    next(errorGetPlanId);
  }
};

const normalizeText = (text) => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};
/* --------- createPlaneador function -------------- */
const createPlaneador = async (req, res, next) => {
  // Obtenemos los datos del planeador a crear
  const { area_formacion, user_id, materia_id } = req.body;
  try {
    const [user_exist, materia_exist] = await Promise.all([
      Usuario.findByPk(user_id),
      Materia.findByPk(materia_id),
    ]);
    // Comprobamos que el id del usuario corresponda a uno válido
    if (!user_exist) {
      req.log.warn(
        `Intento de asociacion de un usuario inexistente a un nuevo planeador por parte del usuario con id ${req.user.id}`
      );
      return res.status(400).json({
        error:
          "El id del usuario proporcionado no corresponde con ninguno existente",
      });
    }
    // Comprobamos que el id de la materia corresponda a uno válido
    if (!materia_exist) {
      req.log.warn(
        `Intento de asociacion de una materia inexistente a un nuevo planeador por parte del usuario con id ${req.user.id}`
      );
      return res.status(400).json({
        error:
          "El id de la materia proporcionado no corresponde con ninguna existente",
      });
    }

    //generamos el nombre del nuevo planeador
    const count = Planeador.count();
    const nombre = `PD--${materia_exist.nombre}--${count + 1}`;

    // Creamos el planeador
    await Planeador.create({
      nombre,
      area_formacion,
      user_id,
      materia_id,
    });
    // Respondemos al usuario
    res
      .status(200)
      .json({ message: "Datos generales del planeador creados exitosamente" });
  } catch (err) {
    const errorCreatePlan = new Error(
      `Ocurrio un problema al crear los datos generales del planeador - ${err.message}`
    );
    errorCreatePlan.stack = err.stack;
    next(errorCreatePlan);
  }
};

/* --------- updatePlaneador function -------------- */
const updatePlaneador = async (req, res, next) => {
  // Obtenemos el id del planeador a actualizar
  const { id } = req.params;
  // Obtenemos los datos a actualizar
  const { area_formacion, user_id, materia_id } = req.body;
  try {
    const [planeador, user_exist, materia_exist] = await Promise.all([
      Planeador.findByPk(id),
      Usuario.findByPk(user_id),
      Materia.findByPk(materia_id),
    ]);
    // Verificamos el planeador
    if (!planeador) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento acceder a un planeador no especificado`
      );
      return res.status(400).json({
        error: "No se encuentra ningun planeador con el id especificado",
      });
    }
    // Comprobamos que el id del usuario corresponda a uno válido
    if (!user_exist) {
      req.log.warn(
        `Intento de asociacion de un usuario inexistente a uno nuevo planeador por parte del usuario con id ${req.user.id}`
      );
      return res.status(400).json({
        error:
          "El id del usuario proporcionado no corresponde con ninguno existente",
      });
    }
    // Comprobamos que el id de la materia corresponda a uno válido
    if (!materia_exist) {
      req.log.warn(
        `Intento de asociacion de una materia inexistente a uno nuevo planeador por parte del usuario con id ${req.user.id}`
      );
      return res.status(400).json({
        error:
          "El id de la materia proporcionada no corresponde con ninguna existente",
      });
    }
    // Actualizamos el planeador
    await planeador.update({
      area_formacion,
      user_id,
      materia_id,
    });

    // Respondemos al usuario
    res
      .status(200)
      .json({
        message: "Datos generales del planeador actualizados correctamente",
      });
  } catch (err) {
    const errorUpdatePlan = new Error(
      `Ocurrio un problema al actualizar los datos generales del planeador - ${err.message}`
    );
    errorUpdatePlan.stack = err.stack;
    next(errorUpdatePlan);
  }
};
/* --------- deletePlaneador function -------------- */
const deletePlaneador = async (req, res, next) => {
  // Obtenemos el identificador del planeador
  const { id } = req.params;

  try {
    // Verificamos la existencia del planeador
    const planeador = await Planeador.findByPk(id, { include: Detalles });
    if (!planeador) {
      req.log.warn("Intento de desvinculación de un planeador inexistente");
      return res
        .status(400)
        .json({ error: "No se encontró el planeador especificado" });
    }
    // Eliminar todos los detalles planeador(filas) asociados al planeador general
    await Detalles.destroy({ where: { planeador_id: planeador.id } });
    // Eliminar la materia misma
    await planeador.destroy();
    // Respondemos al usuario
    res.status(200).json({
      message: "El planeador ha sido eliminado de la plataforma correctamente",
    });
  } catch (error) {
    const errorDelPlan = new Error(
      `Ocurrió un problema al intentar eliminar el planeador - ${error.message}`
    );
    errorDelPlan.stack = error.stack;
    next(errorDelPlan);
  }
};

const controller = {
  getPlenadores,
  getPlaneadorById,
  createPlaneador,
  updatePlaneador,
  deletePlaneador,
};
export default controller;
