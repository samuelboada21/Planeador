import mailGen from 'mailgen';
import logger from '../middlewares/logger.js';
import mail_rover from './mailRover.js';
import configuration from '../config.js';


/**
 * Función encargada de llevar a cabo el correspondiente correo de notificación a los usuarios sobre su inclusión
 * en el aplicativo web y el proceso de ingreso al sistema si es necesario 
 */
const generateEmail = async (userEmails) => {

    return new Promise((resolve, reject) => {

        // Creamos la estructura del email
        const mailGenerator = new mailGen({
            theme: "default",
            product: {
                name: "PLANEADOR_UFPS",
                link: "https://ww2.ufps.edu.co", 
                copyright: 'Copyright © 2024 UFPS. All rights reserved.',
                logo: 'https://divisist2.ufps.edu.co/public/documentos/63b79750fa95f00107f1322ae668405d.png'
            }
        });

        const response = {

            body: {
                greeting: 'Cordial saludo estimado/a Docente',
                intro: `Te damos la bienvenida al aplicativo web Planeador_Docente, El director/ra te ha seleccionado para hacer parte de este sistema.`,
                outro: "Al ser tu primer ingreso en el sistema, es indispensable que te dirijas al apartado de olvidé mi contraseña e ingreses tu correo institucional, de esta forma enviaremos un token para restablecer la contraseña.",
                signature: 'Atentamente, el equipo de desarrollo de ing. de sistemas'
            }
        }

        // Generamos un HTML del email con el cuerpo proporcionado
        const emailBody = mailGenerator.generate(response);

        // Definimos el objeto que envia el correo
        mail_rover()
            .then(async transporter => {

                // Configuramos el origen y destinatario
                const message = {
                    from: configuration.email_address,
                    to: userEmails,
                    subject: 'Notificación de inscripción al sistema Planeador_Docente',
                    html: emailBody
                }

                await transporter.sendMail(message, (error, info) => {

                    if (error) reject(error);
                    else {
                        logger.info(`Email de notificacion enviado a los correos ${userEmails}`);
                        resolve();
                    }

                });

            })
            .catch(err => {
                reject(new Error(`Error al enviar el email de notificacion de inscripcion - ${err.message}`));
            });

    });


};


export default generateEmail;