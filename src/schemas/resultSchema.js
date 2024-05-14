import z from "zod";
import validateData from "../util/validateData.js";

// Esquema para resultado de aprendizaje
const resultSchema = z
  .object({
    body: z
      .object({
        codigo: z
          .string({
            invalid_type_error:
              "El codigo del resultado de aprendizaje solo puede ser texto",
            required_error: "El codigo del resultado de aprendizaje es requerido",
          })
          .refine((value) => /^[A-Z]{3}\d+$/.test(value), {
            message: "El codigo no corresponde con el formato",
          }),
        descripcion: z
          .string({
            invalid_type_error: "La descripcion solo puede ser texto",
            required_error: "La descripcion del resultado de aprendizaje es requerido",
          })
          .max(250, {
            message:
              "La descripción del resultado de aprendizaje supera la cant. de caracteres permitida",
          }),
        estado: z.boolean({
          invalid_type_error:
            "El estado del resultado de aprendizaje solo puede ser un valor booleano",
          required_error: "El estado del resultado de aprendizaje es requerido",
        }),
        competencia_id: z.number({
          invalid_type_error: "El id de la competencia debe ser numerico",
          required_error:
            "El identificador de la competencia asociada es necesario",
        }),
      })
      .partial(),
    params: z
      .object({
        id: z
          .string({
            required_error: "El identificador del resultado de aprendizaje es necesario",
          })
          .regex(/^[0-9]+$/, "Req no válido"),
      })
      .partial(),
    query: z
      .object({
        estado: z
          .string({
            required_error: "El estado del resultado de aprendizaje es requerido",
          })
          .regex(/^(0|1)$/, "El formato de la query no coinicde"),
      })
      .partial(),
  })
  .partial();

// Validación de esquema
export function validateResultData(req, res, next) {
  const errors = validateData(resultSchema, req);
  if (errors.length !== 0) return res.status(400).json({ error: errors });
  next();
}
