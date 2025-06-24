const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch"); // Asegúrate de instalar esto con npm

const app = express();
app.disable("x-powered-by");
const PORT = process.env.PORT || 3000;

const RECAPTCHA_SECRET = "6LdxGWwrAAAAAO-3qxxIISBNTKMeuU5d8GbO1qC-"; // <-- Usa tu clave secreta de reCAPTCHA aquí

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
app.post("/enviar-correo", async (req, res) => {
  const {
    nombre,
    telefono,
    email,
    desarrollo,
    mensaje,
    "g-recaptcha-response": recaptchaToken,
  } = req.body;

  // Validar el token de reCAPTCHA
  if (!recaptchaToken) {
    return res.status(400).send("Falta el token de reCAPTCHA");
  }

  try {
    const captchaResponse = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${RECAPTCHA_SECRET}&response=${recaptchaToken}`,
      },
    );

    const captchaData = await captchaResponse.json();

    if (!captchaData.success) {
      console.error(
        "Error en verificación de reCAPTCHA:",
        captchaData["error-codes"],
      );
      return res.status(400).send("Falló la verificación de reCAPTCHA");
    }

    // Si el captcha fue exitoso, enviar el correo
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "grupojaver@gmail.com",
        pass: "okjy snbu tcks xavp",
      },
    });

    let mailOptions = {
      from: "grupojaver@gmail.com",
      to: "reno7882@gmail.com",
      subject: "Nuevo mensaje Sugerencia / recomendación",
      text: `Nombre: ${nombre}\nTeléfono: ${telefono}\nEmail: ${email}\nDesarrollo: ${desarrollo}\nMensaje: ${mensaje}`,
      bcc: "rct@javer.com.mx",
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error al enviar el correo:", error);
        return res.status(500).send("Hubo un error al enviar el correo");
      } else {
        console.log("Correo enviado: %s", info.response);
        return res.redirect("https://javer.com.mx/gracias");
      }
    });
  } catch (err) {
    console.error("Error al validar reCAPTCHA:", err);
    res.status(500).send("Error interno al verificar reCAPTCHA");
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
