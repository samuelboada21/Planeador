import z from "zod";
import validateData from "../util/validateData.js";

// Esquema para unidad tematica
const unidadSchema = z
  .object({
    body: z
      .object({
        nombre: z
          .string({
            invalid_type_error:
              "El nombre de la unidad tematica solo puede ser texto",
            required_error: "El nombre de la unidad tematica es requerido",
          })
          .min(5, { message: "El nombre de la unidad tematica es muy corto" })
          .max(120, {
            message:
              "El nombre de la unidad tematica supera la cant. de caracteres permitida",
          }),
        descripcion: z
          .string({
            invalid_type_error:
              "La descripcion de la unidad tematica solo puede ser texto",
          })
          .max(250, {
            message:
              "La descripcion de la unidad tematica supera la cant. de caracteres permitida",
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
              "El identificador de la unidad tematica es necesario",
          })
          .regex(/^[0-9]+$/, "Req no válido"),
      })
      .partial(),
  })
  .partial();

// Validación de esquema
export function validateUnidadData(req, res, next) {
  const errors = validateData(unidadSchema, req);
  if (errors.length !== 0) return res.status(400).json({ error: errors });
  next();
}
