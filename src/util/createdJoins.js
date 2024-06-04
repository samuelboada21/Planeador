import MateriaCompetencia from "../models/MateriaCompetencia.js";
import Competencia from "../models/Competencia.js";
import TipoInstrumento from "../models/TipoInstrumento.js";
import TipoEvidencia from "../models/TipoEvidencia.js";

//agrega las relaciones de competencias - materias
export const asignCompetences = async (materiaId, competencias, t, res) => {
  const errorMessage =
    "El formato de las competencias por asignar no es correcto";

  if (competencias === undefined) {
    res.status(400);
    throw new Error("Las competencias de la materia son requeridas");
  }
  if (!Array.isArray(competencias) || competencias.length === 0) {
    res.status(400);
    throw new Error(errorMessage);
  }
  if (!competencias.every((competencia) => typeof competencia === "number")) {
    res.status(400);
    throw new Error(errorMessage);
  }
  // Creamos las relaciones con competencias
  for (const competencia_id of competencias) {
    const existe = await Competencia.findByPk(competencia_id);
    if (!existe) throw new Error("No existe la competencia especificada");
    await MateriaCompetencia.create(
      {
        materia_id: materiaId,
        competencia_id,
      },
      { transaction: t }
    );
  }
};

// Actualiza las relaciones de competencias - materias
export const asignCompetencesUpdate = async (
  materiaId,
  nuevasCompetencias,
  t,
  res
) => {
  const errorMessage =
    "El formato de las competencias por asignar no es correcto";

  if (nuevasCompetencias === undefined) {
    res.status(400);
    throw new Error("Las competencias de la materia son requeridas");
  }
  if (!Array.isArray(nuevasCompetencias) || nuevasCompetencias.length === 0) {
    res.status(400);
    throw new Error(errorMessage);
  }
  if (
    !nuevasCompetencias.every((competencia) => typeof competencia === "number")
  ) {
    res.status(400);
    throw new Error(errorMessage);
  }

  // Obtener las competencias actuales de la materia
  const competenciasActuales = await MateriaCompetencia.findAll({
    where: { materia_id: materiaId },
    attributes: ["competencia_id"],
    raw: true,
    transaction: t,
  });

  const competenciasActualesIds = competenciasActuales.map(
    (competencia) => competencia.competencia_id
  );
  // Encontrar las competencias a eliminar (las que están en competenciasActuales pero no en nuevasCompetencias)
  const competenciasAEliminar = competenciasActualesIds.filter(
    (competencia) => !nuevasCompetencias.includes(competencia)
  );
  // Encontrar las competencias a agregar (las que están en nuevasCompetencias pero no en competenciasActuales)
  const competenciasAAgregar = nuevasCompetencias.filter(
    (competencia) => !competenciasActualesIds.includes(competencia)
  );

  // Eliminar las competencias que ya no están asociadas
  if (competenciasAEliminar.length > 0) {
    await MateriaCompetencia.destroy({
      where: {
        materia_id: materiaId,
        competencia_id: competenciasAEliminar,
      },
      transaction: t,
    });
  }

  // Crear nuevas asociaciones
  for (const competencia_id of competenciasAAgregar) {
    const existe = await Competencia.findByPk(competencia_id);
    if (!existe) {
      res.status(400);
      throw new Error("No existe la competencia especificada");
    }
    await MateriaCompetencia.create(
      {
        materia_id: materiaId,
        competencia_id,
      },
      { transaction: t }
    );
  }
};

//agrega las relaciones de tipo evidencia - instrumento de evaluacion
export const asignTipoEvidencias = async (instrumentoId, tipos, t, res) => {
  const errorMessage =
    "El formato de los tipos de evidencia por asignar no es correcto";

  if (tipos === undefined) {
    res.status(400);
    throw new Error("Los tipos de evidencia del instrumento son requeridas");
  }
  if (!Array.isArray(tipos) || tipos.length === 0) {
    res.status(400);
    throw new Error(errorMessage);
  }
  if (!tipos.every((tipo) => typeof tipo === "number")) {
    res.status(400);
    throw new Error(errorMessage);
  }
  // Creamos las relaciones con tipos
  for (const tipo_id of tipos) {
    const existe = await TipoEvidencia.findByPk(tipo_id);
    if (!existe) throw new Error("No existe el tipo de evidencia especificado");
    await TipoInstrumento.create(
      {
        instrumento_id: instrumentoId,
        tipo_id,
      },
      { transaction: t }
    );
  }
};

//Agrega las nuevas relaciones con tipo de evidencia - instrumento, y elimina las que ya no estan
export const asignTipoUpdate = async (instrumentoId, nuevosTipos, t, res) => {
  const errorMessage =
    "El formato de los tipos de evidencia por asignar no es correcto";

  if (nuevosTipos === undefined) {
    res.status(400);
    throw new Error("Los tipos de evidencia del instrumento son requeridas");
  }
  if (!Array.isArray(nuevosTipos) || nuevosTipos.length === 0) {
    res.status(400);
    throw new Error(errorMessage);
  }
  if (!nuevosTipos.every((tipo) => typeof tipo === "number")) {
    res.status(400);
    throw new Error(errorMessage);
  }

  // Obtener los tipos actuales del instrumento
  const tiposActuales = await TipoInstrumento.findAll({
    where: { instrumento_id: instrumentoId },
    attributes: ["tipo_id"],
    raw: true,
    transaction: t,
  });

  const tiposActualesIds = tiposActuales.map((tipo) => tipo.tipo_id);

  // Encontrar los tipos a eliminar (los que están en tiposActuales pero no en nuevosTipos)
  const tiposAEliminar = tiposActualesIds.filter(
    (tipo) => !nuevosTipos.includes(tipo)
  );

  // Encontrar los tipos a agregar (los que están en nuevosTipos pero no en tiposActuales)
  const tiposAAgregar = nuevosTipos.filter(
    (tipo) => !tiposActualesIds.includes(tipo)
  );

  // Eliminar los tipos que ya no están asociados
  if (tiposAEliminar.length > 0) {
    await TipoInstrumento.destroy({
      where: {
        instrumento_id: instrumentoId,
        tipo_id: tiposAEliminar,
      },
      transaction: t,
    });
  }

  // Crear nuevas asociaciones
  for (const tipo_id of tiposAAgregar) {
    const existe = await TipoEvidencia.findByPk(tipo_id);
    if (!existe) {
      res.status(400);
      throw new Error("No existe el tipo de evidencia especificado");
    }
    await TipoInstrumento.create(
      {
        instrumento_id: instrumentoId,
        tipo_id,
      },
      { transaction: t }
    );
  }
};
