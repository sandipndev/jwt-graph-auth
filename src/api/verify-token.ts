import { User } from "../models";
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
      templateFile: "emails/verified.ejs",
      subject: "Congratulations, your email has been verified!",
      templateData: { email },
    }).then(() => {});
  }

  return res.sendStatus(200);
};

export default verifyToken;
