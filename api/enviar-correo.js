import fetch from "node-fetch";
import nodemailer from "nodemailer";

// Clave secreta de reCAPTCHA
const RECAPTCHA_SECRET_KEY = "6LdxGWwrAAAAAO-3qxxIISBNTKMeuU5d8GbO1qC-";

// Dominios permitidos
const allowedOrigins = [
  "https://casas-javer.github.io",
  "https://buzonjaver.com"
];

// Configurar transportador de correo
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "grupojaver@gmail.com",
    pass: "okjy snbu tcks xavp",
  },
});

// Handler principal
export default async function handler(req, res) {
  const origin = req.headers.origin || req.headers.referer || "";

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Respuesta rápida a preflight
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const {
    nombre,
    telefono,
    email,
    desarrollo,
    mensaje,
    aviso,
    "g-recaptcha-response": token,
  } = req.body;

  // Validación de campos requeridos
  const requiredFields = { nombre, telefono, email, desarrollo, mensaje, token };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value || typeof value !== "string" || value.trim() === "") {
      return res.status(400).json({ message: `El campo "${key}" es obligatorio.` });
    }
  }

  // Validación del nombre
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{4,}$/;
  if (!nameRegex.test(nombre)) {
    return res.status(400).json({
      message: "Nombre inválido. Usa solo letras y al menos 4 caracteres."
    });
  }

  // Validación del teléfono
  const phoneRegex = /^[0-9]{8,10}$/;
  if (!phoneRegex.test(telefono)) {
    return res.status(400).json({
      message: "Teléfono inválido. Debe contener solo números y entre 8 y 10 dígitos."
    });
  }

  // Validación del email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Correo electrónico inválido." });
  }

  // Validar aceptación del aviso de privacidad
  const avisoValido = aviso === true || aviso === "true" || aviso === "on" || aviso === 1;
  if (!avisoValido) {
    return res.status(400).json({ message: "Debes aceptar el aviso de privacidad." });
  }

  // Validación de reCAPTCHA SIEMPRE
  try {
    const params = new URLSearchParams();
    params.append("secret", RECAPTCHA_SECRET_KEY);
    params.append("response", token);

    const recaptchaRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body: params,
    });

    const recaptchaJson = await recaptchaRes.json();

    if (!recaptchaJson.success) {
      return res.status(403).json({ message: "reCAPTCHA inválido" });
    }
  } catch (error) {
    console.error("Error validando reCAPTCHA:", error);
    return res.status(500).json({ message: "Error validando reCAPTCHA" });
  }

  // Configuración del correo
  const mailOptions = {
    from: `"${nombre}" <${email}>`,
    to: "reno7882@gmail.com",
    bcc: "rct@javer.com.mx",
    subject: "Nuevo mensaje Sugerencia / recomendación",
    text: `
Nombre: ${nombre}
Teléfono: ${telefono}
Email: ${email}
Desarrollo: ${desarrollo}
Mensaje: ${mensaje}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Correo enviado correctamente" });
  } catch (error) {
    console.error("Error enviando correo:", error);
    return res.status(500).json({ message: "Error enviando correo" });
  }
}
