import UnidadTematica from "../models/UnidadTematica.js";
import Competencia from "../models/Competencia.js";
import Materia from "../models/Materia.js";
import XLSX from "xlsx";
import { tieneDuplicadosMateria } from "../util/duplicatedData.js";

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
  const { codigo, nombre, tipo, creditos, semestre } = req.body;
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
    // Creamos la materia
    await Materia.create({
      codigo,
      nombre: nombre.toUpperCase(),
      tipo,
      creditos,
      semestre,
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
      attributes: ["id", "codigo"],
      paranoid: false,
    });

    //Inicializamos la transacción
    const result = await sequelize.transaction(async (t) => {
      // Arreglo que contiene los datos de las materias nuevas
      const newMaterias = [];
      // Registramos los datos de las materias
      for (const itemFila of dataExcel) {
        // Validar las cabeceras del archivo
        if (
          !itemFila["semestre"] ||
          !itemFila["codigo"] ||
          !itemFila["cursos"] ||
          !itemFila["obligatorio"] ||
          !itemFila["electivo"] ||
          !itemFila["creditos"]
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
          /^(?! )[A-Za-zÀ-ÖØ-öø-ÿ]+(?: [A-Za-zÀ-ÖØ-öø-ÿ]+)*(?<! )$/;
        // Verifica si el nombre cumple con el formato requerido
        if (!regexName.test(itemFila["nombre"])) {
          res.status(400);
          throw new Error("El formato de nombre no es válido");
        }
        const nombre = itemFila["nombre"];
        // Validamos el formato de los campos "Obligatorio" y "Electivo" y asignamos el valor al campo "tipo"
        const tipo =
          itemFila["Obligatorio"].toLowerCase() === "x"
            ? true
            : itemFila["Electivo"].toLowerCase() === "x"
            ? false
            : null;
        // Verificamos si se marcó tanto "Obligatorio" como "Electivo", lo cual no es válido
        if (tipo === null) {
          res.status(400);
          throw new Error(
            "Debe marcar solo una opción entre 'Obligatorio' y 'Electivo'"
          );
        }

        // Validamos el formato de los creditos
        const regexCreditos = /^\d$/;
        if (!regexCreditos.test(itemFila["creditos"])) {
          res.status(400);
          throw new Error("El formato de los creditos no es valido");
        }
        const creditos = itemFila["creditos"];

        // Verificamos si la materia ya existe tanto en las materias actuales como inactivas
        const existingMateria = existingMaterias.find(
          (materia) => materia.codigo === codigo
        );
        // En caso de no existir creamos la materi
        if (!existingMateria) {
          newMaterias.push({
            codigo,
            nombre,
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

const controller = {
  getMaterias,
  getMateriaById,
  createMateria,
  updateMateria,
  unlinkUnidades,
  createMaterias,
};

export default controller;
