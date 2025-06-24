const nodemailer = require("nodemailer");
const cors = require("cors");

// node-fetch v3 usa ESM, por eso usamos import dinámico:
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const corsMiddleware = cors({
  origin: "*", // Cambia esto a tu dominio en producción
  methods: ["POST"],
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

module.exports = async (req, res) => {
  await runMiddleware(req, res, corsMiddleware);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { nombre, correo, mensaje, token } = req.body;

  // Validación básica
  if (!nombre || !correo || !mensaje || !token) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  // Validar token de reCAPTCHA
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const recaptchaURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

    const response = await fetch(recaptchaURL, {
      method: "POST",
    });

    const data = await response.json();

    if (!data.success || data.score < 0.5) {
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
      from: `"${nombre}" <${correo}>`,
      to: "tu-correo@ejemplo.com",
      subject: "Nuevo mensaje desde el formulario",
      text: mensaje,
    });

    return res.status(200).json({ message: "Correo enviado exitosamente" });
  } catch (error) {
    console.error("Error al enviar correo:", error);
    return res.status(500).json({ message: "Error al enviar el correo" });
  }
};
