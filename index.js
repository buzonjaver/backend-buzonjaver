import nodemailer from "nodemailer";
import cors from "cors";
import fetch from "node-fetch";
import express from "express";

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/enviar-correo", async (req, res) => {
  const { nombre, email, mensaje, telefono, desarrollo } = req.body;
  const recaptchaToken = req.body["g-recaptcha-response"];

  if (
    !nombre ||
    !email ||
    !mensaje ||
    !telefono ||
    !desarrollo ||
    !recaptchaToken
  ) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  // Validar reCAPTCHA v2
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const recaptchaURL = `https://www.google.com/recaptcha/api/siteverify`;

    const response = await fetch(recaptchaURL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secretKey}&response=${recaptchaToken}`,
    });

    const data = await response.json();

    if (!data.success) {
      return res.status(403).json({ message: "reCAPTCHA inválido" });
    }
  } catch (error) {
    console.error("Error en reCAPTCHA:", error);
    return res.status(500).json({ message: "Error al verificar reCAPTCHA" });
  }

  // Enviar correo
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
      text: `
Nombre: ${nombre}
Correo: ${email}
Teléfono: ${telefono}
Desarrollo: ${desarrollo}
Mensaje: ${mensaje}`,
    });

    res.status(200).json({ message: "Correo enviado exitosamente" });
  } catch (error) {
    console.error("Error al enviar correo:", error);
    res.status(500).json({ message: "Error al enviar el correo" });
  }
});

// Para Vercel
export default app;
