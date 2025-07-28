import fetch from "node-fetch";
import nodemailer from "nodemailer";

const RECAPTCHA_SECRET_KEY = "6LdxGWwrAAAAAO-3qxxIISBNTKMeuU5d8GbO1qC-";

const allowedOrigins = [
  "https://casas-javer.github.io",
  "https://buzonjaver.com",
];

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "grupojaver@gmail.com",
    pass: "okjy snbu tcks xavp",
  },
});

export default async function handler(req, res) {
  const origin = req.headers.origin || req.headers.referer || "";

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
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

  // Validación avanzada
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{4,}$/;
  if (!nameRegex.test(nombre)) {
    return res
      .status(400)
      .json({ message: "Nombre inválido. Usa solo letras y al menos 4 caracteres." });
  }

  const phoneRegex = /^[0-9]{8,10}$/;
  if (!phoneRegex.test(telefono)) {
    return res
      .status(400)
      .json({ message: "Teléfono inválido. Debe contener solo números y entre 8 y 10 dígitos." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Correo electrónico inválido." });
  }

  // Validar checkbox de aviso
  const avisoValido =
    aviso === true || aviso === "true" || aviso === "on" || aviso === 1;
  if (!avisoValido) {
    return res.status(400).json({ message: "Debes aceptar el aviso de privacidad." });
  }

  // Validar reCAPTCHA
  try {
    const params = new URLSearchParams();
    params.append("secret", RECAPTCHA_SECRET_KEY);
    params.append("response", token);

    const recaptchaRes = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        body: params,
      }
    );

    const recaptchaJson = await recaptchaRes.json();

    if (!recaptchaJson.success) {
      return res.status(403).json({ message: "reCAPTCHA inválido" });
    }
  } catch (error) {
    console.error("Error validando reCAPTCHA:", error);
    return res.status(500).json({ message: "Error validando reCAPTCHA" });
  }

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



// import nodemailer from "nodemailer";
// import fetch from "node-fetch";

// const RECAPTCHA_SECRET_KEY = "6LdxGWwrAAAAAO-3qxxIISBNTKMeuU5d8GbO1qC-";

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "grupojaver@gmail.com",
//     pass: "okjy snbu tcks xavp", // Cambia aquí por tu password real o app password
//   },
// });

// export default async function handler(req, res) {
//   res.setHeader("Access-Control-Allow-Origin", "https://casas-javer.github.io");
//   res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");

//   if (req.method === "OPTIONS") {
//     return res.status(200).end();
//   }

//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Método no permitido" });
//   }

//   const {
//     nombre,
//     telefono,
//     email,
//     desarrollo,
//     mensaje,
//     "g-recaptcha-response": token,
//   } = req.body;

//   // Validar campos
//   if (!nombre || !telefono || !email || !desarrollo || !mensaje || !token) {
//     return res
//       .status(400)
//       .json({ message: "Faltan campos requeridos o reCAPTCHA" });
//   }

//   // Validar token reCAPTCHA v2
//   try {
//     const params = new URLSearchParams();
//     params.append("secret", RECAPTCHA_SECRET_KEY);
//     params.append("response", token);

//     const recaptchaRes = await fetch(
//       "https://www.google.com/recaptcha/api/siteverify",
//       {
//         method: "POST",
//         body: params,
//       },
//     );

//     const recaptchaJson = await recaptchaRes.json();

//     if (!recaptchaJson.success) {
//       return res.status(403).json({ message: "reCAPTCHA inválido" });
//     }
//   } catch (error) {
//     console.error("Error validando reCAPTCHA:", error);
//     return res.status(500).json({ message: "Error validando reCAPTCHA" });
//   }

//   // Preparar correo
//   const mailOptions = {
//     from: `"${nombre}" <${email}>`,
//     to: "reno7882@gmail.com",
//     bcc: "rct@javer.com.mx",
//     subject: "Nuevo mensaje Sugerencia / recomendación",
//     text: `
// Nombre: ${nombre}
// Teléfono: ${telefono}
// Email: ${email}
// Desarrollo: ${desarrollo}
// Mensaje: ${mensaje}
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     return res.status(200).json({ message: "Correo enviado correctamente" });
//   } catch (error) {
//     console.error("Error enviando correo:", error);
//     return res.status(500).json({ message: "Error enviando correo" });
//   }
// }
