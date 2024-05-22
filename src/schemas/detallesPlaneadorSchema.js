import z from "zod";
import validateData from "../util/validateData.js";

// Custom validation for 'valor_evaluacion'
const valorEvaluacionSchema = z
  .array(
    z.number().min(1, {
      message: "Cada valor del instrumento debe ser al menos 1%",
    }),
    {
      invalid_type_error:
        "Los valores de los instrumentos deben ser un arreglo de números",
      required_error: "'Los valores de los instrumentos son requeridos",
    }
  )
  .refine(
    (valores) => {
      const suma = valores.reduce((acc, curr) => acc + curr, 0);
      return suma <= 100;
    },
    {
      message:
        "La suma de todos los valores de los instrumentos no debe exceder 100%",
    }
  );

// Esquema para detalles planeador
const detallesSchema = z
  .object({
    body: z
      .object({
        valor_evaluacion: valorEvaluacionSchema,
        estrategia_retroalimentacion: z
          .string({
            invalid_type_error:
              "La estrategia de retroalimentacion debe ser texto",
            required_error: "La estrategia de retroalimentacion es requerida",
          })
          .min(5, {
            message: "La estrategia de retroalimentacion es muy corta",
          })
          .max(70, {
            message:
              "La estrategia de retroalimentacion supera la cant. de caracteres permitida",
          }),
        semana_retroalimentacion: z
          .string({
            invalid_type_error: "La semana de retroalimentacion debe ser texto",
            required_error: "La semana de retroalimentacion es requerida",
          })
          .min(7, { message: "La semana de retroalimentacion es muy corta" })
          .max(20, {
            message:
              "La semana de retroalimentacion supera la cant. de caracteres permitida",
          }),
        corte_periodo: z
          .number({
            invalid_type_error: "El periodo de corte debe ser un número",
            required_error: "El periodo de corte es requerido",
          })
          .refine((value) => value >= 1 && value <= 4, {
            message: "El periodo de corte debe ser un solo número entre 1 y 4",
          }),
        semana_actividad_desarrollada: z.string({
          invalid_type_error:
            "Las semanas en que se desarrollan las actividades deben ser texto",
          required_error:
            "Las semanas en que se desarrollan las actividades son requeridas",
        }),
        planeador_id: z.number({
          invalid_type_error: "El id del planeador general debe ser un número",
          required_error: "El id del planeador general es requerido",
        }),
        ra_id: z.number({
          invalid_type_error:
            "El id del resultado de aprendizaje debe ser un número",
          required_error: "El id del resultado de aprendizaje es requerido",
        }),
      })
      .partial(),
    params: z
      .object({
        id: z
          .string({
            required_error:
              "El identificador del detalle del planeador es necesario",
          })
          .regex(/^[0-9]+$/, "Req no válido"),
      })
      .partial(),
  })
  .partial();

// Validación de esquema
export function validateDetallesData(req, res, next) {
  const errors = validateData(detallesSchema, req);
  if (errors.length !== 0) return res.status(400).json({ error: errors });
  next();
}
