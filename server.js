require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("."));

function buildTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP non configuré. Renseignez SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.");
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
}

function formatBody(body) {
  const {
    name = "",
    email = "",
    phone = "",
    company = "",
    need,
    service,
    message = "",
    source = "form",
    path = "",
    website
  } = body || {};

  // honeypot
  if (website) {
    return { blocked: true };
  }

  const chosenService = service || need || "Non précisé";
  if (!name.trim() || (!phone.trim() && !email.trim())) {
    return { error: "Merci d’indiquer au moins un nom et un téléphone ou email." };
  }

  return {
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    company: company.trim(),
    service: chosenService,
    message: message.trim(),
    source,
    path
  };
}

app.post("/api/contact", async (req, res) => {
  let transporter;
  try {
    transporter = buildTransporter();
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }

  const data = formatBody(req.body);
  if (data.blocked) {
    return res.status(200).json({ success: true });
  }
  if (data.error) {
    return res.status(400).json({ success: false, message: data.error });
  }

  const to = process.env.SMTP_TO || process.env.SMTP_USER;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const subject = `[ALARMEVO] Nouvelle demande (${data.service})`;
  const text = [
    `Nom : ${data.name}`,
    `Email : ${data.email || "Non renseigné"}`,
    `Téléphone : ${data.phone || "Non renseigné"}`,
    `Entreprise : ${data.company || "Non renseigné"}`,
    `Service / besoin : ${data.service}`,
    `Message : ${data.message || "—"}`,
    `Source : ${data.source}`,
    `Page : ${data.path}`
  ].join("\n");

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      text
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Erreur envoi mail:", err);
    res.status(500).json({ success: false, message: "Erreur lors de l’envoi. Vérifiez la config SMTP." });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur prêt sur http://localhost:${PORT}`);
});
