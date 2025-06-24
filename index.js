const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.disable("x-powered-by");
const PORT = process.env.PORT || 3000;

// Middleware para analizar los cuerpos de las solicitudes en formato JSON y urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de CORS
const whitelist = [
  "https://javer.com.mx",
  "https://www.javer.com.mx",
  "https://casas-javer.github.io",
  "http://localhost",
  "http://buzonjaver.com",
];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Acceso no autorizado"));
    }
  },
};
app.use(cors(corsOptions));

// Ruta para manejar el envío del formulario
app.post("/enviar-correo", async (req, res) => {
  const { nombre, telefono, email, desarrollo, mensaje, token } = req.body;

  // Validación de campos básicos
  if (!nombre || !telefono || !email || !desarrollo || !mensaje || !token) {
    return res.status(400).send("Faltan campos requeridos.");
  }

  // Validar reCAPTCHA
  try {
    const secretKey = "6LdxGWwrAAAAAO-3qxxIISBNTKMeuU5d8GbO1qC-";
    const recaptchaURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

    const recaptchaRes = await fetch(recaptchaURL, {
      method: "POST",
    });
    const data = await recaptchaRes.json();

    if (!data.success) {
      return res.status(403).send("reCAPTCHA inválido.");
    }
  } catch (error) {
    console.error("Error al verificar reCAPTCHA:", error);
    return res.status(500).send("Error al verificar reCAPTCHA.");
  }

  // Configurar transporte nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "grupojaver@gmail.com",
      pass: "okjy snbu tcks xavp",
    },
  });

  // Configurar los datos del correo
  const mailOptions = {
    from: "grupojaver@gmail.com",
    to: "reno7882@gmail.com",
    bcc: "rct@javer.com.mx",
    subject: "Nuevo mensaje Sugerencia / recomendación",
    text: `Nombre: ${nombre}\nTeléfono: ${telefono}\nEmail: ${email}\nDesarrollo: ${desarrollo}\nMensaje: ${mensaje}`,
  };

  // Enviar el correo
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error al enviar el correo:", error);
      return res.status(500).send("Error al enviar el correo.");
    } else {
      console.log("Correo enviado:", info.response);
      return res.redirect("https://javer.com.mx/gracias");
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
