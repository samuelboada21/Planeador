import z from "zod";
import validateData from "../util/validateData.js";

// Esquema para subtema
const subtemaSchema = z
  .object({
    body: z
      .object({
        nombre: z
          .string({
            invalid_type_error: "El nombre del subtema solo puede ser texto",
            required_error: "El nombre del subtema es requerido",
          })
          .min(5, { message: "El nombre de la unidad tematica es muy corto" })
          .max(120, {
            message:
              "El nombre del subtema supera la cant. de caracteres permitida",
          }),
        descripcion: z
          .string({
            invalid_type_error:
              "La descripcion del subtema solo puede ser texto",
          })
          .max(250, {
            message:
              "La descripcion del subtema supera la cant. de caracteres permitida",
          }),
        unidad_tematica_id: z.number({
          invalid_type_error: "El id de la unidad tematica debe ser numerico",
          required_error:
            "El identificador de la unidad tematica asociada es necesario",
        }),
      })
      .partial(),
    params: z
      .object({
        id: z
          .string({
            required_error: "El identificador del subtema es necesario",
          })
          .regex(/^[0-9]+$/, "Req no válido"),
      })
      .partial(),
  })
  .partial();

// Validación de esquema
export function validateSubtemaData(req, res, next) {
  const errors = validateData(subtemaSchema, req);
  if (errors.length !== 0) return res.status(400).json({ error: errors });
  next();
}
