import z from "zod";
import validateData from "../util/validateData.js";

//Esquema para una competencia
export const categorySchema = z
  .object({
    body: z
      .object({
        nombre: z
          .string({
            invalid_type_error:
              "El nombre de la categoria solo puede ser texto",
            required_error: "El nombre de la categoria es requerido",
          })
          .min(2, { message: "El nombre de la categoria es muy corto" })
          .max(70, {
            message:
              "El nombre de la categoria supera la cant. de caracteres permitidos",
          }),
        descripcion: z
          .string({
            invalid_type_error:
              "La descripcion de la categoria solo puede ser texto",
          })
          .max(300, {
            message:
              "La descripcion de la categoria supera la cant. de caracteres permitidos",
          }),
        estado: z.boolean({
          invalid_type_error: "El estado solo puede ser un valor booleano",
          required_error: "El estado es requerido",
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
          .regex(/^(0|1)$/, "El formato de la query no coincide"),
      })
      .partial(),
  })
  .partial();

// Validación de esquema categoria
export function validateCategoryData(req, res, next) {
  const errors = validateData(categorySchema, req);
  if (errors.length !== 0) return res.status(400).json({ error: errors });
  next();
}
