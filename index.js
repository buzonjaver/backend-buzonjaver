const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.disable("x-powered-by");
const PORT = process.env.PORT || 3000;

// Middleware para analizar los cuerpos de las solicitudes en formato JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de CORS
const whitelist = [
  "https://javer.com.mx",
  "https://www.javer.com.mx",
  "http://localhost",
  "http://buzonjaver.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Acceso no autorizado"));
    }
  },
};
app.use(cors(corsOptions));

// Ruta para manejar el envío del formulario
app.post("/enviar-correo", (req, res) => {
  const { nombre, telefono, email, desarrollo, mensaje } = req.body;

  // Configurar el transporte del correo electrónico usando nodemailer
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "grupojaver@gmail.com", //  Cambiar por tu dirección de correo desde donde se enviarán los correos
      pass: "okjy snbu tcks xavp", // Cambiar por la contraseña de tu correo
      // user: "noreply@javer.com.mx",  Cambiar por tu dirección de correo desde donde se enviarán los correos
      //  pass: "N0r3ply2020M",  Cambiar por la contraseña de tu correo
    },
  });

  // Configurar los datos del correo
  let mailOptions = {
    from: "grupojaver@gmail.com", // Cambiar por tu dirección de correo
    to: "ctrevinov@javer.com.mx", // Dirección de correo a la que se enviará el formulario
    subject: "Nuevo mensaje Sugerencia / recomendación",
    text: `Nombre: ${nombre}\nTeléfono: ${telefono}\nEmail: ${email}\nDesarrollo: ${desarrollo}\nMensaje: ${mensaje}`,
    bcc: "rct@javer.com.mx", // Dirección de correo en copia oculta (BCC)
  };

  // Enviar el correo electrónico
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error al enviar el correo:", error);
      res
        .status(500)
        .type("text/plain")
        .send("Hubo un error al enviar el correo");
    } else {
      console.log("Correo enviado: %s", info.response);
      // res.status(200).send("Correo enviado correctamente");
      // Redirigir al usuario a la página de gracias
      res.redirect("https://javer.com.mx/gracias");
    }
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
