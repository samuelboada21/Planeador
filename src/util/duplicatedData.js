
/**
 * Función encargada de verificar si se encuentran codigos o correos repetidos en el conjunto de docentes
 */
export const tieneDuplicados = (docentes) => {
    let codigos = {};
    let correos_personales = {};
    let correos_institucionales = {};
    for (let docente of docentes) {
        if (codigos[docente.codigo]) {
            return true;
        } else {
            codigos[docente.codigo] = true;
        }
        if (correos_personales[docente.correo_personal]) {
            return true;
        } else {
            correos_personales[docente.correo_personal] = true;
        }
        if (correos_institucionales[docente.correo_institucional]) {
            return true;
        } else {
            correos_institucionales[docente.correo_institucional] = true;
        }
    }
    return false;
}

/**
 * Función encargada de verificar si se encuentran codigos repetidos en el conjunto de materias
 */
export const tieneDuplicadosMateria = (materias) => {
    let codigos = {};
    for (let materia of materias) {
        if (codigos[materia.codigo]) {
            return true;
        } else {
            codigos[materia.codigo] = true;
        }
    }
    return false;
}