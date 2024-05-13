import UnidadTematica from "../models/UnidadTematica.js";
import Subtema from "../models/Subtema.js";
import Competencia from "../models/Competencia.js";
import MateriaCompetencia from "../models/MateriaCompetencia.js";
import Materia from "../models/Materia.js";
import XLSX from "xlsx";
import { tieneDuplicadosMateria } from "../util/duplicatedData.js";
import sequelize from "../database/db.js";
import { asignCompetences } from "../util/createdJoins.js";
import logger from "../middlewares/logger.js";

/* --------- getMaterias function -------------- */
const getMaterias = async (req, res, next) => {
  // Estado
  const state = req.query.estado || true;
  try {
    // Obtenemos las materias
    const materias = await Materia.findAll({
      where: {
        estado: state,
      },
      attributes: [
        "id",
        "codigo",
        "nombre",
        "tipo",
        "creditos",
        "semestre",
        "estado",
      ],
      include: {
        model: Competencia,
        attributes: ["nombre"],
      },
    });
    // Respondemos al usuario
    res.status(200).json(materias);
  } catch (err) {
    const errorGetMat = new Error(
      `Ocurrio un problema al obtener las materias - ${err.message}`
    );
    errorGetMat.stack = err.stack;
    next(errorGetMat);
  }
};

/* --------- getMateriaById function -------------- */
const getMateriaById = async (req, res, next) => {
  // Obtenemos el id de la materia a obtener
  const { id } = req.params;
  try {
    // Obtenemos y verificamos la materia
    const materia = await Materia.findByPk(id, {
      attributes: [
        "codigo",
        "nombre",
        "tipo",
        "creditos",
        "semestre",
        "estado",
      ],
      include: [
        {
          model: Competencia,
          attributes: ["nombre"],
        },
        {
          model: UnidadTematica,
          attributes: ["nombre"],
        },
      ],
    });
    if (!materia) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento acceder a una materia no especificada`
      );
      return res.status(400).json({
        error: "No se encuentra ninguna materia con el id especificado",
      });
    }
    // Respondemos al usuario
    res.status(200).json(materia);
  } catch (err) {
    const errorGetMatId = new Error(
      `Ocurrio un problema al obtener los datos de la materia especificada - ${err.message}`
    );
    errorGetMatId.stack = err.stack;
    next(errorGetMatId);
  }
};

/* --------- createMateria function -------------- */
const createMateria = async (req, res) => {
  // Obtenemos los datos de la materoa a crear
  const { codigo, nombre, tipo, creditos, semestre, competencias } = req.body;
  let result;
  try {
    // Comprobamos que el codigo sea unico
    const matFound = await Materia.findOne({
      where: {
        codigo,
      },
    });
    if (matFound) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento crear una materia ya registrada`
      );
      return res.status(400).json({
        error: `El codigo de la materia ${codigo} ya se encuentra registrado`,
      });
    }
    // Iniciamos la transacción
    result = await sequelize.transaction(async (t) => {
      //creamos la materia
      const materia = await Materia.create(
        {
          codigo,
          nombre: nombre.toUpperCase(),
          tipo,
          creditos,
          semestre,
        },
        { transaction: t }
      );

      //asignamos las competencias
      await asignCompetences(materia.id, competencias, t, res);
      return materia;
    });
    // Respondemos al usuario
    res.status(200).json({ message: "Materia creada exitosamente" });
  } catch (err) {
    const errorCreateMat = new Error(
      `Ocurrio un problema al crear la materia - ${err.message}`
    );
    errorCreateMat.stack = err.stack;
    next(errorCreateMat);
  }
};

/* --------- updateMateria function -------------- */
const updateMateria = async (req, res, next) => {
  // Obtenemos el id de la materia a actualizar
  const { id } = req.params;
  // Obtenemos los datos a actualizar
  const { codigo, nombre, tipo, creditos, semestre, estado, competencias } =
    req.body;
  try {
    // Hacemos las verificaciones de la materia en paralelo
    const [materia, matFound] = await Promise.all([
      Materia.findByPk(id),
      Materia.findOne({
        where: {
          codigo,
        },
      }),
    ]);
    // verificamos la materia
    if (!materia) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento acceder a una materia inexistente.`
      );
      return res.status(400).json({
        error: "No se encuentra ninguna materia con el id especificado",
      });
    }
    // Comprobamos que el nombre sea unico
    if (matFound && materia.codigo !== matFound.codigo) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento usar un codigo de materia ya registrado`
      );
      return res.status(400).json({
        error: `El codigo de materia ${codigo} ya se encuentra registrado`,
      });
    }

    // Iniciamos la transacción
    await sequelize.transaction(async (t) => {
      // Actualizamos los datos de la materia
      await materia.update(
        {
          codigo,
          nombre: nombre.toUpperCase(),
          tipo,
          creditos,
          semestre,
          estado,
        },
        { transaction: t }
      );

      // Eliminamos todas las asociaciones de competencias actuales
      await MateriaCompetencia.destroy(
        { where: { materia_id: id } },
        { transaction: t }
      );

      // Asignamos las nuevas competencias
      await asignCompetences(id, competencias, t, res);
    });

    // Respondemos al usuario
    res.status(200).json({ message: "Materia actualizada correctamente" });
  } catch (err) {
    const errorUpdateMateria = new Error(
      `Ocurrio un problema al actualizar la materia - ${err.message}`
    );
    errorUpdateMateria.stack = err.stack;
    next(errorUpdateMateria);
  }
};

/* --------- removeUnidades function -------------- */
const unlinkUnidades = async (req, res, next) => {
  // Obtenemos el identificador de la unidad
  const { id } = req.params;
  try {
    console.log(id);
    // Obtenemos la unidad a desasociar
    const unidad = await UnidadTematica.findByPk(id, {
      include: [Materia],
    });
    // verificamos la unidad
    if (!unidad) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento desvincular una unidad tematica inexsistente o no asociada a la materia especificada.`
      );
      return res.status(400).json({
        error: "No se encuentra ninguna unidad tematica con el id especificado",
      });
    }
    // Desvinculamos la unidad de su materia
    await unidad.setMateria(null);
    // Respondemos al usuario
    res.status(200).json({
      message: `Unidad tematica ${unidad.nombre} desvinculada exitosamente`,
    });
  } catch (err) {
    const errorUnlinkUni = new Error(
      `Ocurrio un problema al desvincular la unidad tematica de su materia - ${err.message}`
    );
    errorUnlinkUni.stack = err.stack;
    next(errorUnlinkUni);
  }
};

/* --------- createMaterias function -------------- */
const createMaterias = async (req, res, next) => {
  try {
    //obtenemos el archivo excel
    const excelFileBuffer = req.files.archivo.data;
    // Procesamos el archivo excel y obtenemos los datos
    const workbook = XLSX.read(excelFileBuffer, {
      type: "buffer",
    });
    const workbookSheets = workbook.SheetNames;
    const sheet = workbookSheets[0];
    const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

    if (dataExcel.length === 0) {
      res.status(400);
      throw new Error("El archivo excel de materias no puede estar vacio");
    }
    // Verificamos que no haya duplicados en los encabezados
    let headers = Object.keys(dataExcel[0]);
    let headersSet = new Set(headers);
    if (headers.length !== headersSet.size) {
      res.status(400);
      throw new Error("No se permite el uso de encabezados duplicados");
    }
    // Verificamos que no haya duplicados en el conjunto de materias cargadas
    if (tieneDuplicadosMateria(dataExcel)) {
      res.status(400);
      throw new Error("No se permiten materias con codigos repetidos");
    }

    //Inicializamos la transacción
    const result = await sequelize.transaction(async (t) => {
      // Arreglo que contiene los datos de las materias nuevas
      const newMaterias = [];
      const competenciaIdsPorFila = [];
      // Registramos los datos de las materias
      for (const itemFila of dataExcel) {
        // Arreglo para almacenar los IDs de las competencias
        const competenciaIdsDeEstaFila = [];
        // Validar las cabeceras del archivo
        if (
          !itemFila["semestre"] ||
          !itemFila["codigo"] ||
          !itemFila["cursos"] ||
          !itemFila["tipo"] ||
          !itemFila["creditos"] ||
          !itemFila["competencias"]
        ) {
          res.status(400);
          throw new Error("Formato de archivo no correspondiente");
        }

        //validamos el formato del semestre
        const semestreRegex = /^\d{1,2}/;
        if (!semestreRegex.test(itemFila["semestre"])) {
          res.status(400);
          throw new Error("No se permiten semestres de materias no validos");
        }
        const semestre = itemFila["semestre"];

        // Validamos el formato del codigo
        const codeRegex = /^\d{7}$/;
        if (!codeRegex.test(itemFila["codigo"])) {
          res.status(400);
          throw new Error("No se permiten codigos de materias no validos");
        }
        const codigo = itemFila["codigo"];

        // Validamos el formato del nombre
        const regexName =
          /^(?! )[A-Za-zÀ-ÖØ-öø-ÿ.]+(?: [A-Za-zÀ-ÖØ-öø-ÿ.]+)*(?<! )$/;
        // Verifica si el nombre cumple con el formato requerido
        if (!regexName.test(itemFila["cursos"])) {
          res.status(400);
          throw new Error("El formato de nombre no es válido");
        }
        const nombre = itemFila["cursos"];
        // Validamos el formato de los campos "Obligatorio" y "Electivo" y asignamos el valor al campo "tipo"
        const tipo =
          itemFila["tipo"].toLowerCase() === "obligatorio"
            ? true
            : itemFila["tipo"].toLowerCase() === "electivo"
            ? false
            : null;
        // Verificamos si se marcó tanto "Obligatorio" como "Electivo", lo cual no es válido
        if (tipo === null) {
          res.status(400);
          throw new Error(
            "Debe especificar si el curso es obligatirio o electivo"
          );
        }

        // Validamos el formato de los creditos
        const regexCreditos = /^\d$/;
        if (!regexCreditos.test(itemFila["creditos"])) {
          res.status(400);
          throw new Error("El formato de los creditos no es valido");
        }
        const creditos = itemFila["creditos"];

        // Validamos si al menos una competencia fue pasada
        const competencias = itemFila["competencias"].split(",");
        if (competencias.length === 0) {
          res.status(400);
          throw new Error("Debe proporcionar al menos una competencia");
        }
        // Validamos si las competencias existen en la base de datos
        for (const nombreCompetencia of competencias) {
          const competenciaEncontrada = await Competencia.findOne({
            where: {
              nombre: nombreCompetencia.trim().toUpperCase(),
            },
          });
          if (!competenciaEncontrada) {
            res.status(400);
            throw new Error(
              `La competencia ${nombreCompetencia} no existe en la base de datos`
            );
          }
          // Guardamos el ID de la competencia encontrada
          competenciaIdsDeEstaFila.push(competenciaEncontrada.id);
        }
        // Buscar la materia existente con el mismo código
        const materiaEncontrada = await Materia.findOne({
          where: {
            codigo: codigo,
          },
        });
        // En caso de no existir creamos la materia
        if (!materiaEncontrada) {
          newMaterias.push({
            codigo,
            nombre: nombre.toUpperCase(),
            tipo,
            creditos,
            semestre,
          });
          competenciaIdsPorFila.push(competenciaIdsDeEstaFila);
        }
      }
      // Registramos las materias nuevas
      const materiasCreadas = await Materia.bulkCreate(newMaterias, {
        transaction: t,
      });
      // Asignamos las competencias a las materias creadas
      for (let i = 0; i < materiasCreadas.length; i++) {
        await asignCompetences(
          materiasCreadas[i].id,
          competenciaIdsPorFila[i],
          t,
          res
        );
      }

      return {
        newMateriasL: newMaterias.length,
      };
    });

    res.status(200).json({
      message: `Se han creado ${result.newMateriasL} materias nuevas satisfactoriamente al sistema`,
    });
  } catch (error) {
    const errorCargaMateria = new Error(
      `Ocurrio un problema al intentar cargar el listado de materias - ${error.message}`
    );
    errorCargaMateria.stack = error.stack;
    next(errorCargaMateria);
  }
};
/* --------- deleteMateria function -------------- */
const deleteMateria = async (req, res, next) => {
  // Obtenemos el identificador de la materia
  const { id } = req.params;

  try {
    // Verificamos la existencia de la materia
    const materia = await Materia.findByPk(id, {
      include: [{ model: UnidadTematica, include: Subtema }],
    });
    if (!materia) {
      req.log.warn("Intento de desvinculación de una materia inexistente");
      return res
        .status(400)
        .json({ error: "No se encontró la materia especificada" });
    }
    // Eliminar todos los subtemas asociados a las unidades temáticas de la materia
    await Promise.all(
      materia.Unidades_Tematicas.map(async (unidad) => {
        await Subtema.destroy({ where: { unidad_tematica_id: unidad.id } });
      })
    );
    // Eliminar todas las unidades temáticas asociadas a la materia
    await UnidadTematica.destroy({ where: { materia_id: materia.id } });
    // Eliminar la materia misma
    await materia.destroy();
    // Respondemos al usuario
    res.status(200).json({
      message: "La materia ha sido desvinculada de la plataforma correctamente",
    });
  } catch (error) {
    const errorDelMat = new Error(
      `Ocurrió un problema al intentar desvincular la materia - ${error.message}`
    );
    errorDelMat.stack = error.stack;
    next(errorDelMat);
  }
};

const controller = {
  getMaterias,
  getMateriaById,
  createMateria,
  updateMateria,
  unlinkUnidades,
  createMaterias,
  deleteMateria,
};

export default controller;
