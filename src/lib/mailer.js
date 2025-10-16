import nodemailer from "nodemailer";

let cached;
export function getTransporter() {
  if (cached) return cached;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) throw new Error("SMTP env missing");
  cached = nodemailer.createTransport({
    host, port, secure: port === 465, auth: { user, pass },
  });
  return cached;
}
export function sendMail({ to, subject, text, html }) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  return getTransporter().sendMail({ from, to, subject, text, html });
}
