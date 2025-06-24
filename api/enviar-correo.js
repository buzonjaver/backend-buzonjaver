import nodemailer from "nodemailer";
import fetch from "node-fetch";

const RECAPTCHA_SECRET_KEY = "6LdxGWwrAAAAAO-3qxxIISBNTKMeuU5d8GbO1qC-";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "grupojaver@gmail.com",
    pass: "okjy snbu tcks xavp", // Cambia aquí por tu password real o app password
  },
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const {
    nombre,
    telefono,
    email,
    desarrollo,
    mensaje,
    "g-recaptcha-response": token,
  } = req.body;

  // Validar campos
  if (!nombre || !telefono || !email || !desarrollo || !mensaje || !token) {
    return res
      .status(400)
      .json({ message: "Faltan campos requeridos o reCAPTCHA" });
  }

  // Validar token reCAPTCHA v2
  try {
    const params = new URLSearchParams();
    params.append("secret", RECAPTCHA_SECRET_KEY);
    params.append("response", token);

    const recaptchaRes = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        body: params,
      },
    );

    const recaptchaJson = await recaptchaRes.json();

    if (!recaptchaJson.success) {
      return res.status(403).json({ message: "reCAPTCHA inválido" });
    }
  } catch (error) {
    console.error("Error validando reCAPTCHA:", error);
    return res.status(500).json({ message: "Error validando reCAPTCHA" });
  }

  // Preparar correo
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
