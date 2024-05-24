import Materia from "../models/Materia.js";
import Usuario from "../models/Usuario.js";
import Planeador from "../models/Planeador.js";
import Detalles from "../models/DetallesPlaneador.js";
import ResultadoAprendizaje from "../models/ResultadoAprendizaje.js";
import RaCurso from "../models/RaCurso.js";
import TipoEvidencia from "../models/TipoEvidencia.js";
import Instrumento from "../models/InstrumentoEvaluacion.js";
import UnidadTematica from "../models/UnidadTematica.js";
import sequelize from "../database/db.js";

//importamos para hacer las uniones con detalles del planeador
import detalles_raCurso from "../models/DetallesRaCurso.js";
import detalles_tipo from "../models/DetallesTipo.js";
import detalles_instrumento from "../models/DetallesInstrumento.js";
import detalles_unidad from "../models/DetallesUnidad.js";
import TipoInstrumento from "../models/TipoInstrumento.js";

/* --------- getDetallesByPlaneador function -------------- */
const getDetallesByPlaneador = async (req, res, next) => {
  const { id } = req.params; // Obtenemos el ID del planeador general
  try {
    // Verificamos si el planeador existe
    const planeador = await Planeador.findByPk(id);
    if (!planeador) {
      req.log.warn(
        `Planeador con id ${id} no encontrado al intentar obtener los detalles`
      );
      return res.status(404).json({
        error: "Planeador no encontrado para mostrar los detalles",
      });
    }
    // Obtenemos los detalles del planeador (filas del excel) asociadas al planeador
    const detalles = await Detalles.findAll({
      where: { planeador_id: id },
      attributes: [
        "id",
        "valor_evaluacion",
        "estrategia_retroalimentacion",
        "semana_retroalimentacion",
        "corte_periodo",
        "semana_actividad_desarrollada",
      ],
      include: [
        {
          model: ResultadoAprendizaje,
          attributes: ["id", "codigo", "descripcion"],
        },
        {
          model: RaCurso,
          attributes: ["id", "nombre"],
          include: [
            {
              model: TipoEvidencia,
              attributes: ["id", "nombre"],
              include: [
                {
                  model: Instrumento,
                  attributes: ["id", "codigo", "nombre"],
                },
              ],
            },
          ],
        },
        {
          model: UnidadTematica,
          attributes: ["id", "nombre"],
        },
      ],
    });
    // Respondemos al usuario
    res.status(200).json(detalles);
  } catch (err) {
    const errorGetPlan = new Error(
      `Ocurrió un problema al obtener los detalles del planeador - ${err.message}`
    );
    errorGetPlan.stack = err.stack;
    next(errorGetPlan);
  }
};

/* --------- getDetallesById function -------------- */
const getDetallesById = async (req, res, next) => {
  // Obtenemos el id del pleandor a obtener
  const { id } = req.params;
  try {
    // Obtenemos y verificamos el planeador
    const detalle = await Detalles.findByPk(id, {
      attributes: [
        "id",
        "valor_evaluacion",
        "estrategia_retroalimentacion",
        "semana_retroalimentacion",
        "corte_periodo",
        "semana_actividad_desarrollada",
      ],
      include: [
        {
          model: ResultadoAprendizaje,
          attributes: ["id", "codigo", "descripcion"],
        },
        {
          model: RaCurso,
          attributes: ["id", "nombre"],
          include: [
            {
              model: TipoEvidencia,
              attributes: ["id", "nombre"],
              include: [
                {
                  model: Instrumento,
                  attributes: ["id", "codigo", "nombre"],
                  include: [
                    {
                      model: Detalles,
                      attributes: [],
                      where: { id: id },
                      through: { attributes: [] },
                    },
                  ],
                  through: { attributes: [] },
                },
                {
                  model: Detalles,
                  attributes: [],
                  where: { id: id },
                  through: { attributes: [] },
                },
              ],
              through: { attributes: [] },
            },
          ],
          through: { attributes: [] },
        },
        {
          model: UnidadTematica,
          attributes: ["id", "nombre"],
        },
      ],
    });
    if (!detalle) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento acceder a una fila del planeador no especificada`
      );
      return res.status(400).json({
        error:
          "No se encuentra ninguna fila del planeador planeador con el id especificado",
      });
    }
    // Respondemos al usuario
    res.status(200).json(detalles);
  } catch (err) {
    const errorGetPlanId = new Error(
      `Ocurrio un problema al obtener los datos de la fila del planeador especificado - ${err.message}`
    );
    errorGetPlanId.stack = err.stack;
    next(errorGetPlanId);
  }
};

/* ------ createDetallesPlaneador function-----*/
const createDetallesPlaneador = async (req, res, next) => {
  const {
    valor_evaluacion,
    estrategia_retroalimentacion,
    semana_retroalimentacion,
    corte_periodo,
    semana_actividad_desarrollada,
    planeador_id,
    ra_id,
    materia_id,
    raCursos,
    unidadesTematicas,
  } = req.body;

  try {
    // Verificar que el Planeador y el Resultado de Aprendizaje existen
    const planeador = await Planeador.findByPk(planeador_id);
    if (!planeador) {
      return res.status(404).json({ error: "Planeador no encontrado" });
    }
    const resultadoAprendizaje = await ResultadoAprendizaje.findByPk(ra_id);
    if (!resultadoAprendizaje) {
      return res
        .status(404)
        .json({ error: "Resultado de Aprendizaje no encontrado" });
    }
    //los valores deben ser igual al numero de instrumentos usados
    const valoresEvaluacionArray = valor_evaluacion
      .split(",")
      .map((val) => parseFloat(val));
    const sumaValoresEvaluacion = valoresEvaluacionArray.reduce(
      (acc, curr) => acc + curr,
      0
    );
    if (sumaValoresEvaluacion > 100) {
      return res.status(400).json({
        error:
          "La suma de todos los valores de los instrumentos no debe exceder 100%",
      });
    }

    // Iniciar transacción
    await sequelize.transaction(async (t) => {
      // Crear el DetallesPlaneador
      const detallesPlaneador = await Detalles.create(
        {
          valor_evaluacion,
          estrategia_retroalimentacion,
          semana_retroalimentacion,
          corte_periodo,
          semana_actividad_desarrollada,
          planeador_id,
          ra_id,
        },
        { transaction: t }
      );

      // Asociar RaCursos, Tipos de Evidencia e Instrumentos
      for (const raCursoData of raCursos) {
        const raCurso = await RaCurso.findOne({
          where: {
            id: raCursoData.id,
            materia_id: materia_id,
          },
          transaction: t,
        });
        if (raCurso) {
          // Crear relación en DetallesRaCurso
          await detalles_raCurso.create(
            {
              detallesPlaneador_id: detallesPlaneador.id,
              raCurso_id: raCursoData.id,
            },
            { transaction: t }
          );
          for (const tipoEvidenciaData in raCursoData.tiposEvidencias) {
            const tipoEvidencia = await TipoEvidencia.findOne({
              where: {
                id: tipoEvidenciaData.id,
                ra_curso_id: raCurso.id,
              },
              transaction: t,
            });
            if (tipoEvidencia) {
              // Crear relación en DetallesTipo
              await detalles_tipo.create(
                {
                  detallesPlaneador_id: detallesPlaneador.id,
                  tipo_id: tipoEvidencia.id,
                },
                { transaction: t }
              );

              for (const instrumentoId of tipoEvidenciaData.instrumentos) {
                // Verificar si ya existe una relación entre el instrumento y el tipo de evidencia
                const tipoInstrumento = await TipoInstrumento.findOne({
                  where: {
                    tipo_id: tipoEvidencia.id,
                    instrumento_id: instrumentoId,
                  },
                  transaction: t,
                });

                // const existInstrumento = await Instrumento.findByPk(instrumentoId)
                // if(!existInstrumento) {throw new Error(`Instrumento ${instrumentoId} not found`);}

                if (!tipoInstrumento) {
                  // Si no existe, creamos la relación en la tabla intermedia TipoInstrumento
                  await TipoInstrumento.create(
                    {
                      tipo_id: tipoEvidencia.id,
                      instrumento_id: instrumentoId,
                    },
                    { transaction: t }
                  );
                }
                // Crear relación en DetallesInstrumento
                await detalles_instrumento.create(
                  {
                    detallesPlaneador_id: detallesPlaneador.id,
                    instrumento_id: instrumentoId,
                  },
                  { transaction: t }
                );
              }
            }
          }
        } else {
          throw new Error(
            `RaCurso con id ${raCursoData.id} no pertenece a la materia con id ${materia_id}`
          );
        }
      }

      // Asociar Unidades Tematicas
      for (const unidadId of unidadesTematicas) {
        const unidadTematica = await UnidadTematica.findByPk(unidadId, {
          transaction: t,
        });
        if (unidadTematica) {
          // Crear relación en DetallesUnidad
          await detalles_unidad.create(
            {
              detallesPlaneador_id: detallesPlaneador.id,
              unidad_id: unidadTematica.id,
            },
            { transaction: t }
          );
        }
      }

      res.status(201).json(detallesPlaneador);
    });
  } catch (err) {
    next(
      new Error(
        `Ocurrió un problema al crear el DetallesPlaneador: ${err.message}`
      )
    );
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
    res.status(200).json({
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
  getDetallesByPlaneador,
  getDetallesById,
  createDetallesPlaneador,
};
export default controller;
