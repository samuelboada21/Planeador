import z from "zod";
import validateData from "../util/validateData.js";

//valores para tipo de vinculacion
const valoresValidos = [
  "DOCENTE PLANTA",
  "DOCENTE CATEDRA",
  "DOCENTE OCASIONAL",
  "Docente planta",
  "Docente catedra",
  "Docente ocasional",
];
//esquema para usuario
export const usuarioSchema = z
  .object({
    body: z
      .object({
        codigo: z
          .string({
            invalid_type_error: "El codigo solo puede ser texto",
            required_error: "El codigo es requerido",
          })
          .min(4, { message: "El codigo es muy corto" })
          .max(7, {
            message: "El codigo supera la cantidad de digitos permitida",
          }),

        nombre: z
          .string({
            invalid_type_error: "El nombre solo puede ser texto",
            required_error: "El nombre es requerido",
          })
          .min(7, { message: "El nombre es muy corto" })
          .max(60, {
            message: "El nombre supera la cantidad de caracteres permitidos",
          }),

        tipo_vinculacion: z
          .string({
            invalid_type_error: "El tipo de vinculacion solo puede ser texto",
            required_error: "El tipo de vinculacion es requerido",
          })
          .refine((value) => valoresValidos.includes(value), {
            message: "El tipo de vinculación no es válido",
          }),

        departamento: z
          .string({
            invalid_type_error: "El departamento solo puede ser texto",
            required_error: "El departamento es requerido",
          })
          .min(4, { message: "El departamento es muy corto" })
          .max(120, {
            message:
              "El departamento supera la cantidad de caracteres permitidos",
          }),

        correo_personal: z
          .string({
            invalid_type_error: "El email personal solo puede ser texto",
          })
          .email({ message: "El formato del email personal es incorrecto" }),

        correo_institucional: z
          .string({
            invalid_type_error: "El email institucional solo puede ser texto",
            required_error: "El email institucional es requerido",
          })
          .email({
            message: "El formato del email institucional es incorrecto",
          })
          .regex(
            /ufps.edu.co$/,
            "El email proporcionado no corresponde a la UFPS"
          ),
        celular: z
          .string({
            invalid_type_error: "El celular solo puede ser texto",
          })
          .length(10, { message: "El celular solo puede tener 10 digitos" })
          .refine((value) => /^[0-9]+$/.test(value), {
            message: "El celular debe contener solo números",
          }),
        password: z
          .string({
            invalid_type_error: "La contrasenia solo puede ser texto",
            required_error: "La contrasenia es requerida",
          })
          .min(8, { message: "La contrasenia es muy corta" })
          .max(30, {
            message: "La contrasenia excede la cant. maxima de caracteres",
          }),
        tipo: z
          .string({
            invalid_type_error: "El tipo de usuario solo puede ser texto",
            required_error: "El tipo de usuario es requerido",
          })
          .refine((value) => ["Director", "Docente"].includes(value), {
            message: 'El tipo de usuario debe ser "Director" o "Docente"',
          }),
        rol_id: z
          .number({
            invalid_type_error: "El identicador del rol debe ser un numero",
            required_error: "El identificador del rol es requerido",
          })
          .min(1, {
            message: "El identificador del rol no debe ser 0 o negativo",
          }),
      })
      .partial(),

    params: z
      .object({
        id: z
          .string({
            required_error: "El identificador del usuario es necesario",
          })
          .regex(/^[0-9]+$/, "Req no válido"),
      })
      .partial(),

    query: z
      .object({
        estado: z
          .string({
            required_error: "El estado del usuario es requerido",
          })
          .regex(/^(0|1)$/, "El formato de la query no coinicde"),
      })
      .partial(),
  })
  .partial();

// Esquema de inicio de sesión
const loginSchema = z
  .object({
    correo_institucional: z
      .string({
        invalid_type_error: "El email solo puede ser texto",
      })
      .email({ message: "El formato del email es incorrecto" })
      .regex(/ufps.edu.co$/, "El email proporcionado no corresponde a la UFPS"),
    password: z
      .string({
        invalid_type_error: "La contraseña solo puede ser texto",
      })
      .regex(
        new RegExp(/^(?!select|update|delete)/i),
        "Formato de password no valido"
      ),
  })
  .strict();

// Esquema para solicitud de cambio de contraseña
const reqPassResetSchema = z
  .object({
    correo_institucional: z
      .string({
        invalid_type_error: "El email solo puede ser texto",
      })
      .email({ message: "El formato del email es incorrecto" })
      .regex(/ufps.edu.co$/, "El email proporcionado no corresponde a la UFPS"),
    redirectURL: z
      .string({
        invalid_type_error: "La URL solo puede ser texto",
      })
      .url({ message: "El formato de URL no corresponde" }),
  })
  .strict();

export function validateReqPassReset(req, res, next) {
  const errors = validateData(reqPassResetSchema, req.body);
  if (errors.length !== 0) return res.status(400).json({ error: errors });
  next();
}

export function validateLoginData(req, res, next) {
  const errors = validateData(loginSchema, req.body);
  if (errors.length !== 0) return res.status(400).json({ error: errors });
  next();
}

export function validateUserData(req, res, next) {
  const errors = validateData(usuarioSchema, req);
  if (errors.length !== 0) return res.status(400).json({ error: errors });
  next();
}
