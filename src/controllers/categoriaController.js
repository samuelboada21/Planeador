import Competencia from "../models/Competencia.js";
import Categoria from "../models/Categoria.js";

/* --------- getCategorias function -------------- */
const getCategorias = async (req, res, next) => {
  // Estado
  const state = req.query.estado || true;
  try {
    // Obtenemos las categorias
    const categorias = await Categoria.findAll({
      where: {
        estado: state,
      },
      attributes: ["id", "nombre", "estado"],
      include: {
        model: Competencia,
        attributes: ["nombre"],
      },
    });
    // Respondemos al usuario
    res.status(200).json(categorias);
  } catch (err) {
    const errorGetCat = new Error(
      `Ocurrio un problema al obtener las categorias - ${err.message}`
    );
    errorGetCat.stack = err.stack;
    next(errorGetCat);
  }
};

/* --------- getCategoriaById function -------------- */
const getCategoriaById = async (req, res, next) => {
  // Obtenemos el id de la categoria a obtener
  const { id } = req.params;
  try {
    // Obtenemos y verificamos la categoria
    const categoria = await Categoria.findByPk(id, {
      attributes: ["nombre", "descripcion", "estado"],
      include: {
        model: Competencia,
        attributes: ["codigo", "nombre"],
      },
    });
    if (!categoria) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento acceder a una categoria no especificada`
      );
      return res.status(400).json({
        error: "No se encuentra ninguna categoria con el id especificado",
      });
    }
    // Respondemos al usuario
    res.status(200).json(categoria);
  } catch (err) {
    const errorGetCompId = new Error(
      `Ocurrio un problema al obtener los datos de la competencia especificada - ${err.message}`
    );
    errorGetCompId.stack = err.stack;
    next(errorGetCompId);
  }
};

/* --------- createCategoria function -------------- */
const createCategoria = async (req, res, next) => {
  // Obtenemos los datos de la categoria a crear
  
  try {
    const { nombre, descripcion } = req.body;
    if(!nombre) {
      res.status(400).json({ error: "El nombre es requerido"});
    }
    // Comprobamos que el nombre sea unico
    const catFound = await Categoria.findOne({
      where: {
        nombre,
      },
    });
    if (catFound) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento crear una categoria ya registrada`
      );
      return res.status(400).json({
        error: `El nombre de la categoria ${nombre} ya se encuentra registrado`,
      });
    }
    // Creamos la categoria
    await Categoria.create({
      nombre: nombre.toUpperCase(),
      descripcion,
    });
    // Respondemos al usuario
    res.status(200).json({ message: "Categoria creada exitosamente" });
  } catch (err) {
    const errorCreateCat = new Error(
      `Ocurrio un problema al crear la categoria - ${err.message}`
    );
    errorCreateCat.stack = err.stack;
    next(errorCreateCat);
  }
};

/* --------- updateCategoria function -------------- */
const updateCategoria = async (req, res, next) => {
  // Obtenemos el id de la categoria a actualizar
  const { id } = req.params;
  // Obtenemos los datos a actualizar
  const { nombre, descripcion, estado } = req.body;
  try {
    // Hacemos las verificaciones de la categoria en paralelo
    const [categoria, catFound] = await Promise.all([
      Categoria.findByPk(id),
      Categoria.findOne({
        where: {
          nombre,
        },
      }),
    ]);
    // verificamos la categoria
    if (!categoria) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento acceder a una categoria inexistente.`
      );
      return res.status(400).json({
        error: "No se encuentra ninguna categoria con el id especificado",
      });
    }
    // Comprobamos que el nombre sea unico
    if (catFound && categoria.nombre !== catFound.nombre) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento usar un nombre de categoria ya registrado`
      );
      return res.status(400).json({
        error: `El nombre de categoria ${nombre} ya se encuentra registrado`,
      });
    }
    // Actualizamos la categoria
    await categoria.update({
      nombre: nombre.toUpperCase(),
      descripcion,
      estado,
    });
    // ajustamos el estado de las competencias para que sean el mismo de la categoria
    await Competencia.update(
      {
        estado: categoria.estado,
      },
      {
        where: {
          categoria_id: categoria.id,
        },
      }
    );
    // Respondemos al usuario
    res.status(200).json({ message: "Categoria actualizada correctamente" });
  } catch (err) {
    const errorUpdateComp = new Error(
      `Ocurrio un problema al actualizar la categoria - ${err.message}`
    );
    errorUpdateComp.stack = err.stack;
    next(errorUpdateComp);
  }
};

/* --------- removeCompetencia function -------------- */
const unlinkCompetencia = async (req, res, next) => {
  // Obtenemos el identificador de la competencia
  const { id } = req.params;
  try {
    console.log(id);
    // Obtenemos la competencia a desasociar
    const competencia = await Competencia.findByPk(id, {
      include: [Categoria],
    });
    // verificamos la competencia
    if (!competencia) {
      req.log.warn(
        `El usuario con id ${req.user.id} intento desvincular una competencia inexsistente o no asociada a la categoria especificada.`
      );
      return res.status(400).json({
        error: "No se encuentra ninguna competencia con el id especificado",
      });
    }
    // Desvinculamos la competencia de su categoria
    await competencia.setCategoria(null);
    // Respondemos al usuario
    res.status(200).json({
      message: `Competencia ${competencia.nombre} desvinculada exitosamente`,
    });
  } catch (err) {
    const errorUnlinkComp = new Error(
      `Ocurrio un problema al desvincular la competencia de su categoria - ${err.message}`
    );
    errorUnlinkComp.stack = err.stack;
    next(errorUnlinkComp);
  }
};

const controller = {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  unlinkCompetencia,
};

export default controller;
