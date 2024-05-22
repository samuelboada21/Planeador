import z from "zod";
import validateData from "../util/validateData.js";

// Esquema para planeador
const planeadorSchema = z
  .object({
    body: z
      .object({
        nombre: z
          .string({
            invalid_type_error: "El nombre del planeador solo puede ser texto",
            required_error: "El nombre del planeador es requerido",
          })
          .min(3, { message: "El nombre del planeador es muy corto" })
          .max(150, {
            message:
              "El nombre del planeador supera la cant. de caracteres permitida",
          }),
        area_formacion: z.string({
          invalid_type_error:
            "El area de formacion del planeador solo puede ser texto",
          required_error: "El area de formacion del planeador es requerido",
        }),
        user_id: z.number({
          invalid_type_error: "El id del usuario debe ser numerico",
          required_error: "El identificador del usuario asociado es necesario",
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
            required_error: "El identificador del planeador es necesario",
          })
          .regex(/^[0-9]+$/, "Req no válido"),
      })
      .partial(),
  })
  .partial();

// Validación de esquema
export function validatePlaneadorData(req, res, next) {
  const errors = validateData(planeadorSchema, req);
  if (errors.length !== 0) return res.status(400).json({ error: errors });
  next();
}
