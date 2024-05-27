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
import DetallesInstrumento from "../models/DetallesInstrumento.js";

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
  const { id } = req.params; // Obtenemos el id de la fila del planeador a obtener
  try {
    // Obtenemos y verificamos el detalle del planeador
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

    if (!detalle) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento acceder a una fila del planeador no especificada`
      );
      return res.status(400).json({
        error:
          "No se encuentra ninguna fila del planeador con el id especificado",
      });
    }

    // Respondemos al usuario
    res.status(200).json(detalle);
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
    tipoEvidencias,
    instrumentos,
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
      // Gestionar relaciones
      await manageDetallesRelations(
        detallesPlaneador.id,
        {
          raCursos,
          tipoEvidencias,
          instrumentos,
          unidadesTematicas,
          materia_id,
        },
        t
      );
      // Respondemos al usuario
      res.status(200).json({ message: "Fila creada exitosamente" });
    });
  } catch (err) {
    next(
      new Error(
        `Ocurrió un problema al crear el DetallesPlaneador: ${err.message}`
      )
    );
  }
};

/* --------- updateDetallesPlaneador function -------------- */
const updateDetallesPlaneador = async (req, res, next) => {
  const { id } = req.params;
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
    tipoEvidencias,
    instrumentos,
    unidadesTematicas,
  } = req.body;

  try {
    // Verificar que el DetallesPlaneador existe
    const detallesPlaneador = await Detalles.findByPk(id);
    if (!detallesPlaneador) {
      return res.status(404).json({ error: "DetallesPlaneador no encontrado" });
    }

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

    // Iniciar transacción
    await sequelize.transaction(async (t) => {
      // Actualizar el DetallesPlaneador
      await detallesPlaneador.update(
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

      // Eliminar relaciones existentes
      await detalles_raCurso.destroy({
        where: { detallesPlaneador_id: id },
        transaction: t,
      });
      await detalles_tipo.destroy({
        where: { detallesPlaneador_id: id },
        transaction: t,
      });
      await detalles_instrumento.destroy({
        where: { detallesPlaneador_id: id },
        transaction: t,
      });
      await detalles_unidad.destroy({
        where: { detallesPlaneador_id: id },
        transaction: t,
      });
      // Gestionar relaciones
      await manageDetallesRelations(
        id,
        {
          raCursos,
          tipoEvidencias,
          instrumentos,
          unidadesTematicas,
          materia_id,
        },
        t
      );
      // Responder al usuario
      res
        .status(200)
        .json({ message: "DetallesPlaneador actualizado exitosamente" });
    });
  } catch (err) {
    next(
      new Error(
        `Ocurrió un problema al actualizar el DetallesPlaneador: ${err.message}`
      )
    );
  }
};

const manageDetallesRelations = async (
  detallesPlaneadorId,
  { raCursos, tipoEvidencias, instrumentos, unidadesTematicas, materia_id },
  transaction
) => {
  for (let i = 0; i < raCursos.length; i++) {
    const raCursoId = raCursos[i];
    const raCurso = await RaCurso.findOne({
      where: {
        id: raCursoId,
        materia_id: materia_id,
      },
      transaction,
    });
    if (raCurso) {
      // Crear relación en DetallesRaCurso
      await detalles_raCurso.create(
        {
          detallesPlaneador_id: detallesPlaneadorId,
          raCurso_id: raCursoId,
        },
        { transaction }
      );

      // Transformar las cadenas de texto en arrays
      const tipoEvidenciasArray = tipoEvidencias[i]
        .split(",")
        .map((id) => parseInt(id));
      for (let j = 0; j < tipoEvidenciasArray.length; j++) {
        const tipoEvidenciaId = tipoEvidenciasArray[j];
        const tipoEvidencia = await TipoEvidencia.findOne({
          where: {
            id: tipoEvidenciaId,
            ra_curso_id: raCurso.id,
          },
          transaction,
        });
        if (tipoEvidencia) {
          // Crear relación en DetallesTipo
          await detalles_tipo.create(
            {
              detallesPlaneador_id: detallesPlaneadorId,
              tipo_id: tipoEvidencia.id,
            },
            { transaction }
          );

          // Transformar las cadenas de texto en arrays
          const instrumentosArray = instrumentos[j]
            .split(",")
            .map((id) => parseInt(id));
          for (let k = 0; k < instrumentosArray.length; k++) {
            const instrumentoId = instrumentosArray[k];
            const tipoInstrumento = await TipoInstrumento.findOne({
              where: {
                tipo_id: tipoEvidencia.id,
                instrumento_id: instrumentoId,
              },
              transaction,
            });

            if (!tipoInstrumento) {
              // Si no existe, crear la relación en la tabla intermedia TipoInstrumento
              await TipoInstrumento.create(
                {
                  tipo_id: tipoEvidencia.id,
                  instrumento_id: instrumentoId,
                },
                { transaction }
              );
            }

            // Verificar si ya existe relación entre el detallesPlaneador y el instrumento
            const tipoDetalles = await DetallesInstrumento.findOne({
              where: {
                detallesPlaneador_id: detallesPlaneadorId,
                instrumento_id: instrumentoId,
              },
              transaction,
            });
            if (!tipoDetalles) {
              // Crear relación en DetallesInstrumento
              await detalles_instrumento.create(
                {
                  detallesPlaneador_id: detallesPlaneadorId,
                  instrumento_id: instrumentoId,
                },
                { transaction }
              );
            }
          }
        }
      }
    } else {
      throw new Error(
        `RaCurso con id ${raCursoId} no pertenece a la materia con id ${materia_id}`
      );
    }
  }

  // Asociar Unidades Tematicas
  for (const unidadId of unidadesTematicas) {
    const unidadTematica = await UnidadTematica.findByPk(unidadId, {
      transaction,
    });
    if (unidadTematica) {
      // Crear relación en DetallesUnidad
      await detalles_unidad.create(
        {
          detallesPlaneador_id: detallesPlaneadorId,
          unidad_id: unidadTematica.id,
        },
        { transaction }
      );
    }
  }
};

/* --------- deletePlaneador function -------------- */
const deletePlaneador = async (req, res, next) => {
  // Obtenemos el identificador de la fila del planeador
  const { id } = req.params;

  try {
    // Verificamos la existencia de la fila del planeador
    const detallesPlaneador = await Detalles.findByPk(id);
    if (!detallesPlaneador) {
      req.log.warn("Intento de eliminacion de una fila inexistente");
      return res
        .status(400)
        .json({ error: "No se encontró la fila especificada" });
    }
    // Eliminar la fila
    await detallesPlaneador.destroy();

    // Respondemos al usuario
    res.status(200).json({
      message: "La fila del planeador ha sido eliminada de la plataforma correctamente",
    });
  } catch (error) {
    const errorDelPlan = new Error(
      `Ocurrió un problema al intentar eliminar la fila del planeador - ${error.message}`
    );
    errorDelPlan.stack = error.stack;
    next(errorDelPlan);
  }
};

const controller = {
  getDetallesByPlaneador,
  getDetallesById,
  createDetallesPlaneador,
  updateDetallesPlaneador,
  deletePlaneador
};
export default controller;
