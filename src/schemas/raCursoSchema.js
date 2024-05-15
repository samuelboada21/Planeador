import z from "zod";
import validateData from "../util/validateData.js";

// Esquema para unidad tematica
const raCursoSchema = z
  .object({
    body: z
      .object({
        nombre: z
          .string({
            invalid_type_error:
              "El nombre del resultado de aprendizaje del curso solo puede ser texto",
            required_error:
              "El nombre del resultado de aprendizaje del curso es requerido",
          })
          .min(5, {
            message:
              "El nombre del resultado de aprendizaje del curso es muy corto",
          })
          .max(250, {
            message:
              "El nombre del resultado de aprendizaje del curso supera la cant. de caracteres permitida",
          }),
        estado: z.boolean({
          invalid_type_error:
            "El estado el resultado de aprendizaje del curso solo puede ser un valor booleano",
          required_error: "El estado del resultado de aprendizaje del curso es requerido",
        }),
        materia_id: z.number({
          invalid_type_error: "El id de la materia debe ser numerico",
          required_error:
            "El identificador de la materia asociada es necesario",
        }),
      })
      .partial(),
    params: z
      .object({
        id: z
          .string({
            required_error:
              "El identificador del resultado de aprendizaje del curso es necesario",
          })
          .regex(/^[0-9]+$/, "Req no válido"),
      })
      .partial(),
  })
  .partial();

// Validación de esquema
export function validateRaCursoData(req, res, next) {
  const errors = validateData(raCursoSchema, req);
  if (errors.length !== 0) return res.status(400).json({ error: errors });
  next();
}
