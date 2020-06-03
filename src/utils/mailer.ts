import path from "path";

import nodemailer from "nodemailer";
import { renderFile } from "ejs";
import { getTransportConfig, EMAIL_FROM as from } from "../config";

const transportConfig = getTransportConfig();
const transporter = nodemailer.createTransport(transportConfig);

interface sendEmailOptions {
  to: string;
  subject: string;
  templateFile: string;
  completeVerificationLink: string;
}

export const sendEmail = async ({
  to,
  subject,
  templateFile,
  completeVerificationLink,
}: sendEmailOptions): Promise<string> => {
  const templateFilePath = path.resolve(
    path.join(__dirname, "..", templateFile)
  );

  const html = await renderFile(templateFilePath, {
    completeVerificationLink,
  });

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });

  return String(info.messageId);
};
