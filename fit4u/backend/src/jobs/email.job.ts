import { Worker } from "bullmq";
import nodemailer from "nodemailer";

import { env } from "../config/env";
import { logger } from "../config/logger";
import { createRedisConnection } from "../database/redis";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
});

/**
 * Templates email minimalistes — à remplacer par un moteur de templating
 * (MJML/Handlebars) dès que la charte email est disponible ; l'interface du
 * job (payload `{ to, template, variables }`) ne change pas pour autant.
 */
const TEMPLATES: Record<string, (vars: Record<string, unknown>) => { subject: string; html: string }> = {
  "email-verification": (vars) => ({
    subject: "Vérifiez votre adresse email — Fit4U by TH",
    html: `<p>Bienvenue sur Fit4U ! Cliquez pour vérifier votre email : <a href="${vars.verifyUrl}">${vars.verifyUrl}</a></p>`,
  }),
  "password-reset": (vars) => ({
    subject: "Réinitialisation de votre mot de passe — Fit4U by TH",
    html: `<p>Cliquez pour réinitialiser votre mot de passe : <a href="${vars.resetUrl}">${vars.resetUrl}</a></p><p>Ce lien expire dans 1 heure.</p>`,
  }),
};

export const emailWorker = new Worker(
  "email",
  async (job) => {
    const { to, template, variables } = job.data as {
      to: string;
      template: string;
      variables: Record<string, unknown>;
    };
    const build = TEMPLATES[template];
    if (!build) {
      throw new Error(`Template email inconnu : ${template}`);
    }
    const { subject, html } = build(variables);
    await transporter.sendMail({ from: env.EMAIL_FROM, to, subject, html });
    logger.info({ to, template }, "Email envoyé");
  },
  { connection: createRedisConnection() },
);
