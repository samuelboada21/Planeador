import User from "../models/Usuario.js";
import Rol from "../models/Rol.js";
import PasswordReset from "../models/PasswordReset.js";
import Categoria from "../models/Categoria.js";
import Competencia from "../models/Competencia.js";
import Resultado_Aprendizaje from "../models/ResultadoAprendizaje.js";
import Materia from "../models/Materia.js";
import UnidadTematica from "../models/UnidadTematica.js";
import Subtema from "../models/Subtema.js";
import MateriaCompetencia from "../models/MateriaCompetencia.js";
import RaCurso from "../models/RaCurso.js";
import TipoEvidencia from "../models/TipoEvidencia.js";
import TipoInstrumento from "../models/TipoInstrumento.js";
import Instrumento from "../models/InstrumentoEvaluacion.js";
import Planeador from "../models/Planeador.js";
import Detalles from "../models/DetallesPlaneador.js";
import DetallesRaCurso from "../models/DetallesRaCurso.js";
import DetallesInstrumento from "../models/DetallesInstrumento.js";
import DetallesTipo from "../models/DetallesTipo.js";
import DetallesUnidad from "../models/DetallesUnidad.js";

// Definimos la relación Usuario - PasswordReset
User.hasOne(PasswordReset, { foreignKey: "usuario_id", onDelete: "RESTRICT" });
PasswordReset.belongsTo(User, {
  foreignKey: "usuario_id",
});

// Definimos la relación Usuario - Rol
Rol.hasMany(User, { foreignKey: "rol_id", onDelete: "RESTRICT" });
User.belongsTo(Rol, { foreignKey: "rol_id" });

// Definimos la relación Categoria - Competencia
Categoria.hasMany(Competencia, {
  foreignKey: "categoria_id",
  onDelete: "RESTRICT",
});
Competencia.belongsTo(Categoria, {
  foreignKey: "categoria_id",
});

// Definimos la relación Competencia - Resultado_Aprendizaje
Competencia.hasMany(Resultado_Aprendizaje, {
  foreignKey: "competencia_id",
  onDelete: "RESTRICT",
});
Resultado_Aprendizaje.belongsTo(Competencia, {
  foreignKey: "competencia_id",
});

// Definimos la relación Materia - Unidad Tematica
Materia.hasMany(UnidadTematica, {
  foreignKey: "materia_id",
  onDelete: "RESTRICT",
});
UnidadTematica.belongsTo(Materia, {
  foreignKey: "materia_id",
});

// Definimos la relación Unidad Tematica - Subtema
UnidadTematica.hasMany(Subtema, {
  foreignKey: "unidad_tematica_id",
  onDelete: "RESTRICT",
});
Subtema.belongsTo(UnidadTematica, {
  foreignKey: "unidad_tematica_id",
});

// Definimos la relación Materia - Competencia
Materia.belongsToMany(Competencia, {
  through: MateriaCompetencia,
  foreignKey: "materia_id",
});
Competencia.belongsToMany(Materia, {
  through: MateriaCompetencia,
  foreignKey: "competencia_id",
});

// Definimos la relación Materia - Ra Curso
Materia.hasMany(RaCurso, { foreignKey: "materia_id", onDelete: "RESTRICT" });
RaCurso.belongsTo(Materia, { foreignKey: "materia_id" });

// Definimos la relación Ra Curso - Tipo evidencia
RaCurso.hasMany(TipoEvidencia, {
  foreignKey: "ra_curso_id",
  onDelete: "RESTRICT",
});
TipoEvidencia.belongsTo(RaCurso, { foreignKey: "ra_curso_id" });

// Definimos la relación Tipo evidencia - Instrumento evaluacion
TipoEvidencia.belongsToMany(Instrumento, {
  through: TipoInstrumento,
  foreignKey: "tipo_id",
});
Instrumento.belongsToMany(TipoEvidencia, {
  through: TipoInstrumento,
  foreignKey: "instrumento_id",
});

///////////////////////////////////////////////////////////////////////
///////////////RELACIONES DE DETALLES PLANEADOR //////////////////////
/////////////////////////////////////////////////////////////////////

// Definimos la relación Planeador - Detalles Planeador
Planeador.hasMany(Detalles, {
  foreignKey: "planeador_id",
  onDelete: "RESTRICT",
});
Detalles.belongsTo(Planeador, { foreignKey: "planeador_id" });

// Definimos la relación Detalles - RaCurso
Detalles.belongsToMany(RaCurso, {
  through: DetallesRaCurso,
  foreignKey: "detallesPlaneador_id",
});
RaCurso.belongsToMany(Detalles, {
  through: DetallesRaCurso,
  foreignKey: "raCurso_id",
});

// Definimos la relación Detalles - Instrumento
Detalles.belongsToMany(Instrumento, {
  through: DetallesInstrumento,
  foreignKey: "detallesPlaneador_id",
});
Instrumento.belongsToMany(Detalles, {
  through: DetallesInstrumento,
  foreignKey: "instrumento_id",
});

// Definimos la relación Detalles - Tipo de evidencia
Detalles.belongsToMany(TipoEvidencia, {
  through: DetallesTipo,
  foreignKey: "detallesPlaneador_id",
});
TipoEvidencia.belongsToMany(Detalles, {
  through: DetallesTipo,
  foreignKey: "tipo_id",
});

// Definimos la relación Detalles - Unidades tematicas
Detalles.belongsToMany(UnidadTematica, {
  through: DetallesUnidad,
  foreignKey: "detallesPlaneador_id",
});
UnidadTematica.belongsToMany(Detalles, {
  through: DetallesUnidad,
  foreignKey: "unidad_id",
});