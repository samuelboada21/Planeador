import MateriaCompetencia from "../models/MateriaCompetencia.js";
import Competencia from "../models/Competencia.js";

export const asignCompetences = async (materiaId, competencias, t, res) => {
    const errorMessage = 'El formato de las competencias por asignar no es correcto'

    if(competencias === undefined) {
        res.status(400);
        throw new Error('Las competencias de la materia son requeridas');
    }
    if(!Array.isArray(competencias)|| competencias.length === 0){
        res.status(400);
        throw new Error(errorMessage);
    }
    if (!competencias.every(competencia => typeof competencia === 'number')) {
        res.status(400);
        throw new Error(errorMessage);
    }
    // Creamos las relaciones con competencias
    for (const competencia_id of competencias) {
        const existe = await Competencia.findByPk(competencia_id)
        if(!existe) throw new Error("No existe la competencia especificada")
        await MateriaCompetencia.create({
            materia_id: materiaId,
            competencia_id
        }, { transaction: t });

    }
}

export const asignTipoEvidencias = async (instrumentoId, tipos, t, res) => {

    
}