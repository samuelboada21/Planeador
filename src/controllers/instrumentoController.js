import TipoEvidencia from "../models/TipoEvidencia.js";
import TipoInstrumento from "../models/TipoInstrumento.js";
import Instrumento from "../models/InstrumentoEvaluacion.js";
import XLSX from "xlsx";
import { tieneDuplicadosInstrumento } from "../util/duplicatedData.js";
import sequelize from "../database/db.js";
import { asignTipoEvidencias, asignTipoUpdate } from "../util/createdJoins.js";

/* --------- getInstrumentos function -------------- */
const getInstrumentos = async (req, res, next) => {
  try {
    // Obtenemos los instrumentos
    const instrumentos = await Instrumento.findAll({
      attributes: ["id", "codigo", "nombre", "descripcion"],
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
      attributes: ["codigo", "nombre", "descripcion"],
      include: {
        model: TipoEvidencia,
        attributes: ["nombre"],
      },
    });
    if (!instrumento) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento acceder a un instrumento no especificado`
      );
      return res.status(400).json({
        error:
          "No se encuentra ningun instrumento de evaluacion con el id especificado",
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
  const { nombre, descripcion, tipos } = req.body;
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
    const count = await Instrumento.count();
    const codigo = `IE${count + 1}`;
    // Iniciamos la transacción
    result = await sequelize.transaction(async (t) => {
      //creamos el instrumento
      const instrumento = await Instrumento.create(
        {
          codigo,
          nombre: nombre.toLowerCase(),
          descripcion,
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
  const { nombre, descripcion, tipos } = req.body;
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
        error:
          "No se encuentra ningun instrumento de evaluacion con el id especificado",
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
          nombre: nombre.toLowerCase(),
          descripcion,
        },
        { transaction: t }
      );
      // Asignamos los nuevos tipos de evidencias
      await asignTipoUpdate(id, tipos, t, res);
    });

    // Respondemos al usuario
    res
      .status(200)
      .json({ message: "Instrumento de evaluacion actualizado correctamente" });
  } catch (err) {
    const errorUpdateIns = new Error(
      `Ocurrio un problema al actualizar el instrumento de evaluacion - ${err.message}`
    );
    errorUpdateIns.stack = err.stack;
    next(errorUpdateIns);
  }
};

/* --------- createInstrumentos function -------------- */
const createInstrumentos = async (req, res, next) => {
  try {
    const count = await Instrumento.count();
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
      throw new Error(
        "El archivo excel de instrumentos de evaluacion no puede estar vacio"
      );
    }
    // Verificamos que no haya duplicados en los encabezados
    let headers = Object.keys(dataExcel[0]);
    let headersSet = new Set(headers);
    if (headers.length !== headersSet.size) {
      res.status(400);
      throw new Error("No se permite el uso de encabezados duplicados");
    }
    // Verificamos que no haya duplicados en el conjunto de materias cargadas
    if (tieneDuplicadosInstrumento(dataExcel)) {
      res.status(400);
      throw new Error("No se permiten instrumentos de evaluacion repetidos");
    }

    //Inicializamos la transacción
    const result = await sequelize.transaction(async (t) => {
      // Arreglo que contiene los datos de los instrumentos nuevs
      const newInstrumentos = [];
      let contadorAuxiliar = 0;
      // Registramos los datos de los instrumentos
      for (const itemFila of dataExcel) {
        // Validar las cabeceras del archivo, que cada fila contenga elementos!!!
        if (!itemFila["instrumento"]) {
          res.status(400);
          throw new Error("Formato de archivo no correspondiente");
        }

        const nombre = itemFila["instrumento"].trim().toLowerCase();
        const descripcion = itemFila["descripcion"]
          ? itemFila["descripcion"].trim().toLowerCase()
          : "";
        // Buscar el instrumento existente con el mismo nombre
        const instrumentoEncontrado = await Instrumento.findOne({
          where: {
            nombre: nombre,
          },
        });
        // En caso de no existir creamos el instrumento
        if (!instrumentoEncontrado) {
          contadorAuxiliar++;
          const codigo = `IE${count + contadorAuxiliar}`;
          newInstrumentos.push({
            codigo: codigo,
            nombre: nombre,
            descripcion: descripcion,
          });
        }
      }

      // Registramos los instrumentos nuevos
      await Instrumento.bulkCreate(newInstrumentos, {
        transaction: t,
      });

      return {
        newInstrumentosL: newInstrumentos.length,
      };
    });

    res.status(200).json({
      message: `Se han creado ${result.newInstrumentosL} instrumentos de evaluacion nuevos satisfactoriamente al sistema`,
    });
  } catch (error) {
    const errorCargaInst = new Error(
      `Ocurrio un problema al intentar cargar el listado de instrumentos de evaluacion - ${error.message}`
    );
    errorCargaInst.stack = error.stack;
    next(errorCargaInst);
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
      return res.status(400).json({
        error: "No se encontro el instrumento de evaluacion especificado",
      });
    }
    // Eliminar el instrumento de evaluacion
    await instrumento.destroy();
    // Respondemos al usuario
    res.status(200).json({
      message:
        "El instrumento ha sido desvinculado de la plataforma correctamente",
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
