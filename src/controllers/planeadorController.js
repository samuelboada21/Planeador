import Materia from "../models/Materia.js";
import Usuario from "../models/Usuario.js";
import Planeador from "../models/Planeador.js";
import Detalles from "../models/DetallesPlaneador.js";
import ResultadoAprendizaje from "../models/ResultadoAprendizaje.js";
import RaCurso from "../models/RaCurso.js";
import TipoEvidencia from "../models/TipoEvidencia.js";
import Instrumento from "../models/InstrumentoEvaluacion.js";
import UnidadTematica from "../models/UnidadTematica.js";
import Subtema from "../models/Subtema.js";
import ExcelJS from "exceljs";

/* --------- getPlaneadores function -------------- */
const getPlaneadores = async (req, res, next) => {
  try {
    // Obtenemos las planeadores
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
  // Obtenemos el id del planeador a obtener
  const { id } = req.params;
  try {
    // Obtenemos y verificamos el planeador
    const planeador = await fetchPlaneadorById(id);
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
    const count = await Planeador.count();
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

const fetchPlaneadorById = async (id) => {
  return Planeador.findByPk(id, {
    attributes: ["nombre", "area_formacion"],
    include: [
      {
        model: Usuario,
        attributes: ["id", "codigo", "nombre"],
      },
      {
        model: Materia,
        attributes: ["id", "codigo", "nombre", "tipo", "creditos"],
      },
      {
        model: Detalles,
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
            include: [
              {
                model: Subtema,
                attributes: ["id", "nombre"],
              },
            ],
          },
        ],
      },
    ],
  });
};

// Crear archivo Excel
const createExcelFile = async (req, res, next) => {
  const { id } = req.params;
  try {
    const planeador = await fetchPlaneadorById(id);
    if (!planeador) {
      return res.status(400).json({
        error: "No se encuentra ningún planeador con el id especificado",
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Planeador Docente");

    // Encabezado
    worksheet.mergeCells("B3:L5");
    worksheet.getCell("B3").value = "Planeador Docente";
    worksheet.getCell("B3").font = { size: 14, bold: true };

    // Función auxiliar para asignar valores y hacer merge de celdas
    const setCellValueAndMerge = (cell, mergeRange, title, value) => {
      worksheet.getCell(cell).value = title;
      worksheet.mergeCells(mergeRange);
      worksheet.getCell(mergeRange.split(":")[0]).value = value;
    };

    // Asignar valores y hacer merge de celdas usando la función auxiliar
    setCellValueAndMerge(
      "B7",
      "C7:D7",
      "Nombre del Profesor",
      planeador.Usuario.nombre
    );
    setCellValueAndMerge(
      "B8",
      "C8:D8",
      "Área de Formación",
      planeador.area_formacion
    );
    setCellValueAndMerge(
      "B9",
      "C9:D9",
      "Código del Curso",
      planeador.Materia.codigo
    );
    setCellValueAndMerge(
      "B10",
      "C10:D10",
      "Nombre del Curso",
      planeador.Materia.nombre
    );
    setCellValueAndMerge(
      "B11",
      "C11:D11",
      "Tipo de Curso",
      planeador.Materia.tipo === 0 ? "Electiva" : "Obligatoria"
    );
    setCellValueAndMerge(
      "B12",
      "C12:D12",
      "Número de Créditos",
      planeador.Materia.creditos
    );

    // Títulos de las columnas
    const headers = [
      "Resultado de Aprendizaje",
      "Resultado de Aprendizaje Curso",
      "Tipo de evidencia de Aprendizaje",
      "Instrumento de Evaluacion",
      "Valor de la evaluacion del Instrumento",
      "Estrategia o metodología a emplear para realimentar estudiante",
      "Semana de realimentación sobre la evaluación",
      "Corte del periodo de evaluación",
      "En que Semana se realiza la actividad",
      "Unidad(es) Tematica(s)",
      "Subtemas",
    ];

    const headerRow = worksheet.getRow(15);
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 2); // B is the 2nd column
      cell.value = header;
      cell.font = { bold: true };
      worksheet.getColumn(index + 2).width = 40; // Ajusta el valor 25 según sea necesario
    });
    headerRow.commit();

    let currentRow = 16;

    planeador.Detalles_Planeadores.forEach((detalle) => {
      const ra = detalle.Resultados_Aprendizaje;
      const raCursos = detalle.Ra_Cursos;
      // Formatear las unidades temáticas como una lista
      const unidadTematicaStr = detalle.Unidades_Tematicas.map(
        (unidad) => `* ${unidad.nombre}`
      ).join("\n");
      let raStartRow = currentRow;

      raCursos.forEach((raCurso) => {
        let raCursoStartRow = currentRow;

        const tiposEvidencia = raCurso.Tipo_Evidencias;
        tiposEvidencia.forEach((tipoEvidencia) => {
          let tipoEvidenciaStartRow = currentRow;

          const instrumentos = tipoEvidencia.Instrumentos;
          instrumentos.forEach((instrumento, instrumentoIndex) => {
            // Recorrer las unidades temáticas y los subtemas
            const subtemasStr = detalle.Unidades_Tematicas.flatMap((unidad) =>
              unidad.Subtemas.map((subtema) => `- ${subtema.nombre}`)
            ).join("\n");

            worksheet.addRow([
              null, // Para dejar la columna A vacía
              ra.descripcion,
              raCurso.nombre,
              tipoEvidencia.nombre,
              instrumento.nombre,
              detalle.valor_evaluacion.split(",")[instrumentoIndex], // Valor de evaluación correspondiente al instrumento
              detalle.estrategia_retroalimentacion,
              detalle.semana_retroalimentacion,
              detalle.corte_periodo,
              detalle.semana_actividad_desarrollada,
              unidadTematicaStr,
              subtemasStr,
            ]);

            currentRow++;
          });

          // Combinar celdas para Tipo de evidencia de Aprendizaje
          if (tipoEvidenciaStartRow < currentRow - 1) {
            worksheet.mergeCells(
              `D${tipoEvidenciaStartRow}:D${currentRow - 1}`
            );
          }
        });

        // Combinar celdas para Resultado de Aprendizaje Curso y estrategia_retroalimentacion
        if (raCursoStartRow < currentRow - 1) {
          worksheet.mergeCells(`C${raCursoStartRow}:C${currentRow - 1}`);
          worksheet.mergeCells(`G${raCursoStartRow}:G${currentRow - 1}`);
        }
      });

      // Combinar celdas para Resultado de Aprendizaje, semana_retroalimentación, corte de evaluación y semana_actividad_desarrollada, unidades temáticas
      if (raStartRow < currentRow - 1) {
        worksheet.mergeCells(`B${raStartRow}:B${currentRow - 1}`);
        worksheet.mergeCells(`H${raStartRow}:H${currentRow - 1}`);
        worksheet.mergeCells(`I${raStartRow}:I${currentRow - 1}`);
        worksheet.mergeCells(`J${raStartRow}:J${currentRow - 1}`);
        worksheet.mergeCells(`K${raStartRow}:K${currentRow - 1}`);
        worksheet.mergeCells(`L${raStartRow}:L${currentRow - 1}`);
      }
    });

    // Aplicar wrapText a todas las celdas
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
      });
    });

    // Aplicar wrapText a todas las celdas
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
      });
    });

    // Aplicar wrapText a todas las celdas
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
      });
    });

    const filePath = "PlaneadorDocente.xlsx";
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, (err) => {
      if (err) {
        next(err);
      } else {
        console.log(`Archivo Excel creado: ${filePath}`);
      }
    });
  } catch (error) {
    next(
      new Error(
        `Ocurrió un problema al crear el archivo Excel: ${error.message}`
      )
    );
  }
};

const controller = {
  getPlaneadores,
  getPlaneadorById,
  createPlaneador,
  updatePlaneador,
  deletePlaneador,
  createExcelFile,
};
export default controller;
