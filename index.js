import nodemailer from "nodemailer";
import cors from "cors";
import express from "express";
import fetch from "node-fetch";

const app = express();

// Middleware CORS
app.use(
  cors({
    origin: "*", // Cambia a tu dominio en producción
    methods: ["POST"],
  }),
);

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta POST /enviar-correo
app.post("/enviar-correo", async (req, res) => {
  const { nombre, email, mensaje, token } = req.body;

  // Validación básica
  if (!nombre || !email || !mensaje || !token) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  // Validar token de reCAPTCHA
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const recaptchaURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

    const response = await fetch(recaptchaURL, { method: "POST" });
    const data = await response.json();

    if (!data.success || (data.score !== undefined && data.score < 0.5)) {
      return res
        .status(403)
        .json({ message: "reCAPTCHA inválido o sospechoso" });
    }
  } catch (error) {
    console.error("Error con reCAPTCHA:", error);
    return res.status(500).json({ message: "Error al verificar reCAPTCHA" });
  }

  // Configurar transporte de nodemailer
  const transporter = nodemailer.createTransport({
    host: "smtp.tu-servidor.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"${nombre}" <${email}>`,
      to: "tu-correo@ejemplo.com",
      subject: "Nuevo mensaje desde el formulario",
      text: mensaje,
    });

    return res.status(200).json({ message: "Correo enviado exitosamente" });
  } catch (error) {
    console.error("Error al enviar correo:", error);
    return res.status(500).json({ message: "Error al enviar el correo" });
  }
});

// Servidor escuchando en puerto 3000 o puerto definido en env
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
