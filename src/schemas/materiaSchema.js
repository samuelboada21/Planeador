import z from "zod";
import validateData from "../util/validateData.js";

// Esquema para materia
const materiaSchema = z
  .object({
    body: z
      .object({
        codigo: z
          .string({
            invalid_type_error: "El codigo de la materia solo puede ser texto",
            required_error: "El codigo de la materia es requerido",
          })
          .refine((value) => /^\d{7}$/.test(value), {
            message:
              "El codigo no corresponde con el formato, debe contener 7 digitos",
          }),
        nombre: z
          .string({
            invalid_type_error: "El nombre de la materia solo puede ser texto",
            required_error: "El nombre de la materia es requerido",
          })
          .min(10, { message: "El nombre de la materia es muy corto" })
          .max(120, {
            message:
              "El nombre de la materia supera la cant. de caracteres permitida",
          }),
        tipo: z.boolean({
          invalid_type_error:
            "El tipo de la materia solo puede ser un valor booleano",
          required_error: "El tipo de la materia es requerido",
        }),
        creditos: z
          .string({
            invalid_type_error:
              "Los creditos de la materia solo pueden ser texto",
            required_error: "Los creditos de la materia son requeridos",
          })
          .refine((value) => /^\d{1}$/.test(value), {
            message:
              "Los creditos no corresponden con el formato, debe contener 1 digito",
          }),
          semestre: z
          .string({
            invalid_type_error:
              "El semestre de la materia solo pueden ser texto",
            required_error: "El semestre de la materia es requerido",
          })
          .refine((value) => /^\d{1,2}$/.test(value), {
            message:
              "El semestre no corresponden con el formato, debe contener 1 o 2 digitos",
          }),
        estado: z.boolean({
          invalid_type_error:
            "El estado de la materia solo puede ser un valor booleano",
          required_error: "El estado de la materia es requerido",
        }),
      })
      .partial(),
    params: z
      .object({
        id: z
          .string({
            required_error: "El identificador de la materia es necesario",
          })
          .regex(/^[0-9]+$/, "Req no válido"),
      })
      .partial(),
    query: z
      .object({
        estado: z
          .string({
            required_error: "El estado de la materia es requerido",
          })
          .regex(/^(0|1)$/, "El formato de la query no coincide"),
      })
      .partial(),
  })
  .partial();

// Validación de esquema
export function validateMateriaData(req, res, next) {
  const errors = validateData(materiaSchema, req);
  if (errors.length !== 0) return res.status(400).json({ error: errors });
  next();
}
