import path from "path";
import { User } from "../models";
import { renderFile } from "ejs";
import { sendEmail } from "../utils/mailer";

import { Request, Response } from "express";

const verifyToken = async (req: Request, res: Response) => {
  const id = req.params.id;
  const token = req.params.token;
  const user = await User.findById(id);

  if (!user) return res.sendStatus(400);

  const { email } = user;

  if (!user.verified) {
    if (user.verificationToken !== token) return res.sendStatus(400);

    await User.findByIdAndUpdate(id, {
      $set: {
        verificationToken: "",
        verified: true,
      },
    });

    sendEmail({
      to: email,
      templateFile: "pages/verified-email.ejs",
      subject: "Congratulations, your email has been verified!",
      templateData: { email },
    }).then(() => {});
  }

  const htmlPath = path.resolve(
    path.join(__dirname, "..", "pages/verify-token.ejs")
  );
  const html = await renderFile(htmlPath, { email });

  return res.status(200).send(html);
};

export default verifyToken;
