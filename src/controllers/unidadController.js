import UnidadTematica from "../models/UnidadTematica.js";
import Subtema from "../models/Subtema.js";
import Materia from "../models/Materia.js";
import XLSX from "xlsx";
import { tieneDuplicadosMateria } from "../util/duplicatedData.js";
import sequelize from "../database/db.js";
import logger from '../middlewares/logger.js'

/* --------- getUnidades function -------------- */
const getUnidades = async (req, res, next) => {
  try {
    // Obtenemos las unidades
    const unidades = await UnidadTematica.findAll({
      attributes: [
        "nombre",
        "descripcion",
      ],
      include: {
        model: Materia,
        attributes: ["codigo","nombre"],
      },
    });
    // Respondemos al usuario
    res.status(200).json(unidades);
  } catch (err) {
    const errorGetUni = new Error(
      `Ocurrio un problema al obtener las unidades tematicas - ${err.message}`
    );
    errorGetUni.stack = err.stack;
    next(errorGetUni);
  }
};

/* --------- getUnidadById function -------------- */
const getUnidadById = async (req, res, next) => {
  // Obtenemos el id de la unidad a obtener
  const { id } = req.params;
  try {
    // Obtenemos y verificamos la unidad
    const unidad = await UnidadTematica.findByPk(id, {
      attributes: [
        "nombre",
        "descripcion",
      ],
      include: [
        {
          model: Materia,
          attributes: ["codigo","nombre"],
        },
      ],
    });
    if (!unidad) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento acceder a una unidad no especificada`
      );
      return res.status(400).json({
        error: "No se encuentra ninguna unidad tematica con el id especificado",
      });
    }
    // Respondemos al usuario
    res.status(200).json(unidad);
  } catch (err) {
    const errorGetUniId = new Error(
      `Ocurrio un problema al obtener los datos de la materia especificada - ${err.message}`
    );
    errorGetUniId.stack = err.stack;
    next(errorGetUniId);
  }
};

/* --------- createUnidad function -------------- */
const createUnidad = async (req, res) => {
  // Obtenemos los datos de la materoa a crear
  const {nombre,descripcion, materia_id } = req.body;
  try {
    // Buscar la materia para la que se quiere crear la unidad
    const materia = await Materia.findByPk(materia_id);
    if (!materia) {
      return res.status(404).json({ error: "La materia especificada no existe" });
    }
    // Verificar si la unidad temática ya está asociada a la materia
    const unidadExistente = await UnidadTematica.findOne({
      where: {
        nombre,
        materia_id: materia_id,
      },
    });

    if (unidadExistente) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento crear una unidad tematica ya registrada en la materia`
      );
      return res.status(400).json({
        error: `La unidad tematica ${nombre} ya se encuentra registrada en esta materia`,
      });
    }
    // Creamos la unidad
    await UnidadTematica.create({
      nombre: nombre.toUpperCase(),
      descripcion,
      materia_id,
    });
    // Respondemos al usuario
    res.status(200).json({ message: "Unidad tematica creada exitosamente" });
  } catch (err) {
    const errorCreateUni = new Error(
      `Ocurrio un problema al crear la unidad tematica - ${err.message}`
    );
    errorCreateUni.stack = err.stack;
    next(errorCreateUni);
  }
};

/* --------- updateMateria function -------------- */
const updateMateria = async (req, res, next) => {
  // Obtenemos el id de la materia a actualizar
  const { id } = req.params;
  // Obtenemos los datos a actualizar
  const { codigo, nombre, tipo, creditos, semestre, estado } = req.body;
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
    // Actualizamos la materia
    await materia.update({
      codigo,
      nombre: nombre.toUpperCase(),
      tipo,
      creditos,
      semestre,
      estado,
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
    // Obtenemos todos los docentes existentes
    const existingMaterias = await Materia.findAll({
      attributes: ["codigo"]
    });

    //Inicializamos la transacción
    const result = await sequelize.transaction(async (t) => {
      // Arreglo que contiene los datos de las materias nuevas
      const newMaterias = [];
      // Registramos los datos de las materias
      for (const itemFila of dataExcel) {
        // Validar las cabeceras del archivo
        if (!itemFila["semestre"]||!itemFila["codigo"]||!itemFila["cursos"]||!itemFila["tipo"]||!itemFila["creditos"]){
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

        // Buscar la materia existente con el mismo código
        const materiaEncontrada = await Materia.findOne({
          where: {
            codigo: codigo
          }
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
        }
      }
      // Registramos las materias nuevas
      await Materia.bulkCreate(newMaterias, {
        returning: true,
        transaction: t,
      });

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
    const materia = await Materia.findByPk(id);

    if (!materia) {
      req.log.warn("Intento de desvinculación de una materia inexistente");
      return res
        .status(400)
        .json({ error: "No se encontro la materia especificada" });
    }
    // Eliminamos la cuenta del usuario
    await materia.destroy();
    res.status(200).json({
      message: "La materia ha sido desvinculada de la plataforma correctamente",
    });
  } catch (error) {
    const errorDelMat = new Error(
      `Ocurrio un problema al intentar desvincular la materia - ${error.message}`
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
  deleteMateria
};

export default controller;
