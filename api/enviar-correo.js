import nodemailer from "nodemailer";
import fetch from "node-fetch";
import cors from "cors";

// Configurar CORS para Vercel
const corsMiddleware = cors({
  origin: [
    "https://javer.com.mx",
    "https://www.javer.com.mx",
    "https://casas-javer.github.io",
  ],
  methods: ["POST"],
});

// Middleware async para CORS
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) reject(result);
      else resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, corsMiddleware);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const { nombre, telefono, email, desarrollo, mensaje, token } = req.body;

  if (!nombre || !telefono || !email || !desarrollo || !mensaje || !token) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  // Verificación del token de reCAPTCHA
  try {
    const secretKey = "6LdxGWwrAAAAAO-3qxxIISBNTKMeuU5d8GbO1qC-";
    const recaptchaURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

    const response = await fetch(recaptchaURL, { method: "POST" });
    const data = await response.json();

    if (!data.success) {
      return res.status(403).json({ message: "reCAPTCHA inválido" });
    }
  } catch (error) {
    console.error("Error al verificar reCAPTCHA:", error);
    return res.status(500).json({ message: "Error al verificar reCAPTCHA" });
  }

  // Configurar transporte nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "grupojaver@gmail.com",
      pass: "okjy snbu tcks xavp",
    },
  });

  const mailOptions = {
    from: "grupojaver@gmail.com",
    to: "reno7882@gmail.com",
    bcc: "rct@javer.com.mx",
    subject: "Nuevo mensaje Sugerencia / recomendación",
    text: `Nombre: ${nombre}\nTeléfono: ${telefono}\nEmail: ${email}\nDesarrollo: ${desarrollo}\nMensaje: ${mensaje}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Correo enviado correctamente" });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    return res.status(500).json({ message: "Error al enviar el correo" });
  }
}
