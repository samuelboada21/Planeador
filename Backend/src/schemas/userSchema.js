import z from 'zod';
import validateData from '../util/validateData.js';

//valores para tipo de vinculacion
const valoresValidos = ["DOCENTE PLANTA", "DOCENTE CATEDRA", "DOCENTE OCASIONAL"]
//esquema para usuario
export const usuarioSchema = z.object({

    codigo: z
    .string({
        invalid_type_error: 'El codigo solo puede ser texto',
        required_error: 'El codigo es requerido' 
    })
    .min(4, {message: 'El codigo es muy corto'})
    .max(7, {message: 'El codigo supera la cantidad de digitos permitida'}),

    nombre: z
    .string({
        invalid_type_error: 'El nombre solo puede ser texto',
        required_error: 'El nombre es requerido'
    })
    .min(7, {message: 'El nombre es muy corto'})
    .max(60, {message: 'El nombre supera la cantidad de caracteres permitidos'}),

    tipo_vinculacion: z
    .string({
        invalid_type_error: 'El tipo de vinculacion solo puede ser texto',
        required_error: 'El tipo de vinculacion es requerido'
    })
    .refine((value) => valoresValidos.includes(value), { message: 'El tipo de vinculación no es válido' }),

    departamento: z
    .string({
        invalid_type_error: 'El departamento solo puede ser texto',
        required_error: 'El departamento es requerido'
    })
    .min(4, {message: 'El departamento es muy corto'})
    .max(120, {message: 'El departamento supera la cantidad de caracteres permitidos'}),

    area_formacion:  z
    .string({
        invalid_type_error: 'El area de formacion solo puede ser texto',
        required_error: 'El area de formacion es requerido'
    })
    .min(4, {message: 'El area de formacion es muy corto'})
    .max(60, {message: 'El area de formacion supera la cantidad de caracteres permitidos'}),

    correo_personal: z
    .string({
        invalid_type_error: 'El email personal solo puede ser texto',
        required_error: 'El email personal es requerido'
    })
    .email({ message: 'El formato del email personal es incorrecto' }),

    correo_institucional: z
    .string({
        invalid_type_error: 'El email institucional solo puede ser texto',
        required_error: 'El email institucional es requerido'
    })
    .email({ message: 'El formato del email institucional es incorrecto' })
    .regex(/ufps.edu.co$/, 'El email proporcionado no corresponde a la UFPS'),
    

}).partial();