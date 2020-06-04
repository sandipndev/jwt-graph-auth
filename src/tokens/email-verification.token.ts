import { tokenPayload } from "./../types/token.payload";
import { sign, verify } from "jsonwebtoken";

import { User, IUser } from "./../models";
import {
  EXPIRESIN_EMAILVERIFICATIONTOKEN,
  SECRET_OTHERTOKENS,
} from "../config";

const createEmailVerificationToken = async (user: IUser): Promise<string> => {
  const emailVerificationToken = sign(
    { userId: user.id, isEmailVerificationToken: true },
    SECRET_OTHERTOKENS,
    {
      expiresIn: EXPIRESIN_EMAILVERIFICATIONTOKEN,
    }
  );

  await User.findByIdAndUpdate(user.id, {
    $set: {
      emailVerificationToken,
    },
  });

  return emailVerificationToken;
};

const verifyEmailVerificationToken = async (token: string): Promise<IUser> => {
  const payload = verify(token, SECRET_OTHERTOKENS);
  if ((payload as tokenPayload).isEmailVerificationToken !== true)
    throw new Error("Token incorrect");

  const user = await User.findById((payload as tokenPayload).userId);

  if (!user) throw new Error("User does not exist");
  if (user.emailVerificationToken !== token)
    throw new Error("Token doesn't exist on user");

  const updatedUser = await User.findByIdAndUpdate(user.id, {
    $set: {
      verified: true,
      emailVerificationToken: "",
    },
  });

  if (!updatedUser) throw new Error("User does not exist");
  return updatedUser;
};

export { createEmailVerificationToken, verifyEmailVerificationToken };
