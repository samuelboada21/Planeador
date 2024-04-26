import z from "zod";
import validateData from "../util/validateData.js";

// Esquema para competencia
const competenceSchema = z
  .object({
    body: z
      .object({
        codigo: z
          .string({
            invalid_type_error:
              "El codigo de la competencia solo puede ser texto",
            required_error: "El codigo de la competencia es requerido",
          })
          .refine((value) => /^[A-Z]{2}\d+$/.test(value), {
            message: "El codigo no corresponde con el formato",
          }),
        nombre: z
          .string({
            invalid_type_error:
              "El nombre de la competencia solo puede ser texto",
            required_error: "El nombre de la competencia es requerido",
          })
          .min(2, { message: "El nombre de la competencia es muy corto" })
          .max(70, {
            message:
              "El nombre de la competencia supera la cant. de caracteres permitida",
          }),
        descripcion: z
          .string({
            invalid_type_error: "La descripción solo puede ser texto",
          })
          .max(240, {
            message:
              "La descripción de la competencia supera la cant. de caracteres permitida",
          }),
        estado: z.boolean({
          invalid_type_error:
            "El estado de la competencia solo puede ser un valor booleano",
          required_error: "El estado de la competencia es requerido",
        }),
        competencia_id: z.number({
          invalid_type_error: "El id de la categoria debe ser numerico",
          required_error:
            "El identificador de la categoria asociada es necesario",
        }),
      })
      .partial(),
    params: z
      .object({
        id: z
          .string({
            required_error: "El identificador de la categoria es necesario",
          })
          .regex(/^[0-9]+$/, "Req no válido"),
      })
      .partial(),
    query: z
      .object({
        estado: z
          .string({
            required_error: "El estado de la categoria es requerido",
          })
          .regex(/^(0|1)$/, "El formato de la query no coinicde"),
      })
      .partial(),
  })
  .partial();

// Validación de esquema
export function validateCompetenceData(req, res, next) {
  const errors = validateData(competenceSchema, req);
  if (errors.length !== 0) return res.status(400).json({ error: errors });
  next();
}
