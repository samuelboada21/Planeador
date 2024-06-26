import mailGen from "mailgen";
import crypto from "crypto";
import PasswordReset from "../models/PasswordReset.js";
import bcrypt from "bcrypt";
import mail_rover from "./mailRover.js";
import logger from "../middlewares/logger.js";
import dayjs from "dayjs";
import configuration from "../config.js";
import nodeMailer from 'nodemailer';

// Obtenemos las credenciales del correo
const { email_address, email_password } = configuration;
/**
 * Función encargada de el envio de correo para el restablecimiento de contraseña de un usuario
 */
const sendResetEmail = async (user, redirectURL) => {
  try {
    const { id, correo_institucional, nombre } = user;
    // Generamos la cadena de reseteo
    const resetString = crypto.randomBytes(64).toString("hex") + id;
    const hashedString = await hashResetString(id, resetString);
    // Creamos o actualizamos el registro de restablecimiento
    updateRecordReset(id, hashedString);
    // Crear un objeto de configuración con las credenciales
    let config = {
      service: "gmail",
      auth: {
        user: email_address,
        pass: email_password,
      },
      port: 465,
      secure: true,
    };
    // Creamos el objeto transportador
    const transporter = nodeMailer.createTransport(config);
    // Creamos la estructura del email y generamos el HTML
    const emailBody = createEmailEstructure(
      id,
      nombre,
      redirectURL,
      hashedString
    );
    // Configuramos el origen y destinatario
    const message = {
      from: email_address,
      to: correo_institucional,
      subject: "Restablecimiento de contraseña",
      html: emailBody,
    };
    // Enviamos el correo electronico
    await transporter.sendMail(message);
    logger.info(
      `Email de restablecimiento enviado correctamente al correo ${correo_institucional}`
    );
  } catch (error) {
    throw new Error(
      `Error al enviar email de restablecimiento: ${error.message}`
    );
  }
};

/**
 * Función encargada de encriptar la cadena de restablecimiento de contraseña
 */
const hashResetString = async (id, resetString) => {
  // Hasheamos la cadena de restablecimiento
  const saltRounds = await bcrypt.genSalt(11);
  const hashed = bcrypt.hash(resetString, saltRounds);

  return hashed;
};
/**
 * Función encargada de crear o actualizar el registro de restablecimiento de contraseña según sea el caso
 */
const updateRecordReset = async (id, resetString) => {
  // Hasheamos la cadena de restablecimiento y verificamos si el usuario ya posee un registro de restablecimiento
  const [hashedString, existingReset] = await Promise.all([
    hashResetString(id, resetString),
    PasswordReset.findOne({
      where: {
        usuario_id: id,
      },
    }),
  ]);

  if (existingReset) {
    // Actualizamos el actual
    existingReset.uniqueString = hashedString;
    existingReset.created_At = dayjs().toDate();
    existingReset.expires_At = dayjs().add(1, "hours").toDate();
    existingReset.expired = false;

    await existingReset.save();
  } else {
    // Creamos un nuevo registro de restablecimiento
    await PasswordReset.create({
      uniqueString: hashedString,
      created_At: dayjs().toDate(),
      expires_At: dayjs().add(1, "hours").toDate(),
      expired: false,
      usuario_id: id,
    });
  }
};
/**
 * Función encargada de crear el cuerpo del correo de restablecimiento de contraseña
 */
const createEmailEstructure = (id, nombre, redirectURL, resetString) => {
  const mailGenerator = new mailGen({
    theme: "default",
    product: {
      name: "PLANEADOR_UFPS",
      link: "https://ww2.ufps.edu.co",
      copyright: "Copyright © 2024 UFPS. All rights reserved.",
      logo: "https://divisist2.ufps.edu.co/public/documentos/63b79750fa95f00107f1322ae668405d.png",
    },
  });

  const response = {
    body: {
      greeting: "Cordial saludo",
      name: `${nombre}`,
      intro:
        "Has recibido este correo debido a que recibimos una solicitud de cambio de contraseña de tu parte",
      action: {
        instructions: "Haz click en el botón ubicado en la parte inferior.",
        button: {
          color: "#eb343d",
          text: "Restablecer contraseña",
          link: `${redirectURL}/${id}/${resetString}`,
        },
      },
      outro:
        "Recuerda que este link expirará en 60 minutos, si no solicitaste un cambio de contraseña hacer caso omiso a este mensaje",
      signature: "Atentamente, el equipo de desarrollo de ing. de sistemas",
    },
  };
  return mailGenerator.generate(response);
};

export default sendResetEmail;

// // Creamos o actualizamos el registro de restablecimiento
// updateRecordReset(id, resetString);
// // Creamos la estructura del email y generamos el HTML
// const emailBody = createEmailEstructure(id, nombre, redirectURL, resetString);
// // Definimos el objeto que envia el correo
// mail_rover()
//   .then(async (transporter) => {
//     // Configuramos el origen y destinatario
//     const message = {
//       from: configuration.email_address,
//       to: correo_institucional,
//       subject: "Restablecimiento de contraseña",
//       html: emailBody,
//     };

//     await transporter.sendMail(message, (error, info) => {
//       if (error) reject(error);
//       else {
//         logger.info(
//           `Email de restablecimiento enviado al correo ${correo_institucional}`
//         );
//         resolve();
//       }
//     });
//   })
//   .catch((err) => {
//     reject(
//       new Error(
//         `Error al enviar el email de restablecimiento - ${err.message}`
//       )
//     );
//   });
// };


