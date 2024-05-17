import z from "zod";
import validateData from "../util/validateData.js";

// Esquema para instrumento
const instrumentoSchema = z
  .object({
    body: z
      .object({
        codigo: z
          .string({
            invalid_type_error:
              "El codigo del instrumento de evaluacion solo puede ser texto",
            required_error:
              "El codigo del instrumento de evaluacion es requerido",
          })
          .refine((value) => /^[A-Z]{2}\d+$/.test(value), {
            message: "El codigo no corresponde con el formato",
          }),
        nombre: z
          .string({
            invalid_type_error:
              "El instrumento de evaluacion solo puede ser texto",
            required_error: "El instrumento de evaluacion es requerido",
          })
          .max(60, {
            message: "El instrumento supera la cant. de caracteres permitida",
          }),
        descripcion: z
          .string({
            invalid_type_error: "La descripcion solo puede ser texto",
            required_error:
              "La descripcion del instrumetno de evaluacion es requerido",
          })
          .max(250, {
            message:
              "La descripción del instrumento de evaluacion supera la cant. de caracteres permitida",
          }),
      })
      .partial(),
    params: z
      .object({
        id: z
          .string({
            required_error:
              "El identificador del instrumento de evaluacion es necesario",
          })
          .regex(/^[0-9]+$/, "Req no válido"),
      })
      .partial(),
  })
  .partial();

// Validación de esquema
export function validateInstrumentoData(req, res, next) {
  const errors = validateData(instrumentoSchema, req);
  if (errors.length !== 0) return res.status(400).json({ error: errors });
  next();
}
