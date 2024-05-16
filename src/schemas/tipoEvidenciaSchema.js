import z from "zod";
import validateData from "../util/validateData.js";

// Esquema para tipo de evidencia
const tipoEvidenciaSchema = z
  .object({
    body: z
      .object({
        nombre: z
          .string({
            invalid_type_error:
              "El tipo de evidencia solo puede ser texto",
            required_error:
              "El tipo de evidencia es requerido",
          })
          .min(5, {
            message:
              "El tipo de evidencia es muy corto",
          })
          .max(250, {
            message:
              "El tipo de evidencia supera la cant. de caracteres permitida",
          }),
        ra_curso_id: z.number({
          invalid_type_error: "El id del resultado de aprendizaje de curso debe ser numerico",
          required_error:
            "El identificador del resultado de aprendizaje de curso asociado es necesario",
        }),
      })
      .partial(),
    params: z
      .object({
        id: z
          .string({
            required_error:
              "El identificador del tipo de evidencia es necesario",
          })
          .regex(/^[0-9]+$/, "Req no válido"),
      })
      .partial(),
  })
  .partial();

// Validación de esquema
export function validateTipoEvidenciaData(req, res, next) {
  const errors = validateData(tipoEvidenciaSchema, req);
  if (errors.length !== 0) return res.status(400).json({ error: errors });
  next();
}
