import TipoEvidencia from "../models/TipoEvidencia.js";
import TipoInstrumento from "../models/TipoInstrumento.js";
import Instrumento from "../models/InstrumentoEvaluacion.js";
import XLSX from "xlsx";
import { tieneDuplicadosMateria } from "../util/duplicatedData.js";
import sequelize from "../database/db.js";
import { asignTipoEvidencias } from "../util/createdJoins.js";

/* --------- getInstrumentos function -------------- */
const getInstrumentos = async (req, res, next) => {
 
  try {
    // Obtenemos los instrumentos
    const instrumentos = await Instrumento.findAll({
      attributes: [
        "id",
        "codigo",
        "nombre",
        "descripcion"
      ],
      include: {
        model: TipoEvidencia,
        attributes: ["nombre"],
      },
    });
    // Respondemos al usuario
    res.status(200).json(instrumentos);
  } catch (err) {
    const errorGetIns = new Error(
      `Ocurrio un problema al obtener los instrumentos de evaluacion - ${err.message}`
    );
    errorGetIns.stack = err.stack;
    next(errorGetIns);
  }
};

/* --------- getInstrumentoById function -------------- */
const getInstrumentoById = async (req, res, next) => {
  // Obtenemos el id del instrumento a obtener
  const { id } = req.params;
  try {
    // Obtenemos y verificamos el isntrumento
    const instrumento = await Instrumento.findByPk(id, {
      attributes: [
        "codigo",
        "nombre",
        "descripcion",
      ],
      include:
        {
          model: TipoEvidencia,
          attributes: ["nombre"],
        },
    });
    if (!instrumento) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento acceder a un instrumento no especificado`
      );
      return res.status(400).json({
        error: "No se encuentra ningun instrumento de evaluacion con el id especificado",
      });
    }
    // Respondemos al usuario
    res.status(200).json(instrumento);
  } catch (err) {
    const errorGetInsId = new Error(
      `Ocurrio un problema al obtener los datos del instrumento especificado - ${err.message}`
    );
    errorGetInsId.stack = err.stack;
    next(errorGetInsId);
  }
};

/* --------- createInstrumento function -------------- */
const createInstrumento = async (req, res) => {
  // Obtenemos los datos del instrumento a crear
  const { codigo, nombre, descripcion, tipos } = req.body;
  let result;
  try {
    // Comprobamos que el nombre sea unico
    const insFound = await Instrumento.findOne({
      where: {
        nombre,
      },
    });
    if (insFound) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento crear un instrumento ya registrado`
      );
      return res.status(400).json({
        error: `El instrumento ${nombre} ya se encuentra registrado`,
      });
    }
    // Iniciamos la transacción
    result = await sequelize.transaction(async (t) => {
      //creamos el instrumento
      const instrumento = await Instrumento.create(
        {
          codigo,
          nombre: nombre.toLowerCase(),
          descripcion
        },
        { transaction: t }
      );

      //asignamos los tipos de evidencia asociados
      await asignTipoEvidencias(instrumento.id, tipos, t, res);
      return instrumento;
    });
    // Respondemos al usuario
    res.status(200).json({ message: "Instrumento creado exitosamente" });
  } catch (err) {
    const errorCreateIns = new Error(
      `Ocurrio un problema al crear el instrumento - ${err.message}`
    );
    errorCreateIns.stack = err.stack;
    next(errorCreateIns);
  }
};

/* --------- updateInstrumento function -------------- */
const updateInstrumento = async (req, res, next) => {
  // Obtenemos el id del instrumento a actualizar
  const { id } = req.params;
  // Obtenemos los datos a actualizar
  const { codigo, nombre, descripcion, tipos } =
    req.body;
  try {
    // Hacemos las verificaciones del instrumento en paralelo
    const [instrumento, insFound] = await Promise.all([
      Instrumento.findByPk(id),
      Instrumento.findOne({
        where: {
          nombre,
        },
      }),
    ]);
    // verificamos la materia
    if (!instrumento) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento acceder a un instrumento inexistente.`
      );
      return res.status(400).json({
        error: "No se encuentra ningun instrumento de evaluacion con el id especificado",
      });
    }
    // Comprobamos que el nombre sea unico
    if (insFound && instrumento.nombre !== insFound.nombre) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento usar un nombre de instrumento ya registrado`
      );
      return res.status(400).json({
        error: `El instrumento ${nombre} ya se encuentra registrado`,
      });
    }

    // Iniciamos la transacción
    await sequelize.transaction(async (t) => {
      // Actualizamos los datos de la materia
      await instrumento.update(
        {
          codigo,
          nombre: nombre.toLowerCase(),
          descripcion,
        },
        { transaction: t }
      );

      // Eliminamos todas las asociaciones de tipos de evidencia actuales
      await TipoInstrumento.destroy(
        { where: { tipo_id: id } },
        { transaction: t }
      );

      // Asignamos los nuevos tipos de evidencias
      await asignTipoEvidencias(id, tipos, t, res);
    });

    // Respondemos al usuario
    res.status(200).json({ message: "Instrumento de evaluacion actualizado correctamente" });
  } catch (err) {
    const errorUpdateIns = new Error(
      `Ocurrio un problema al actualizar el instrumento de evaluacion - ${err.message}`
    );
    errorUpdateIns.stack = err.stack;
    next(errorUpdateIns);
  }
};

/* --------- createMaterias function -------------- */
const createInstrumentos = async (req, res, next) => {
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

/* --------- deleteInstrumento function -------------- */
const deleteInstrumento = async (req, res, next) => {
  // Obtenemos el identificador del instrumento
  const { id } = req.params;

  try {
    // Verificamos la existencia del instrumento
    const instrumento = await Instrumento.findByPk(id);
    if (!instrumento) {
      req.log.warn("Intento de desvinculación de un instrumento inexistente");
      return res
        .status(400)
        .json({ error: "No se encontro el instrumento de evaluacion especificado" });
    }
    // Eliminar el instrumento de evaluacion
    await instrumento.destroy();
    // Respondemos al usuario
    res.status(200).json({
      message: "El instrumento ha sido desvinculado de la plataforma correctamente",
    });
  } catch (error) {
    const errorDelIns = new Error(
      `Ocurrió un problema al intentar desvincular el instrumento de evaluacion - ${error.message}`
    );
    errorDelIns.stack = error.stack;
    next(errorDelIns);
  }
};

const controller = {
  getInstrumentos,
  getInstrumentoById,
  createInstrumento,
  updateInstrumento,
  createInstrumentos,
  deleteInstrumento,
};

export default controller;
