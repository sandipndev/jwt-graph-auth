import { tokenPayload } from "./../types/token.payload";
import { sign, verify } from "jsonwebtoken";

import verifyToken from "../utils/verify-token";
import { User, IUser } from "./../models";
import {
  EXPIRESIN_FORGOTPASSWORDTOKEN,
  SECRET_FORGOTPASSWORDTOKEN,
} from "../config";

const _verifyForgotPasswordToken = (token: string) =>
  verifyToken(token, SECRET_FORGOTPASSWORDTOKEN);

const createForgotPasswordToken = async (user: IUser): Promise<string> => {
  const forgotPasswordToken = sign(
    { userId: user.id, isForgotPasswordToken: true },
    SECRET_FORGOTPASSWORDTOKEN,
    {
      expiresIn: EXPIRESIN_FORGOTPASSWORDTOKEN,
    }
  );

  const validTokens = user.forgotPasswordTokens.filter(
    _verifyForgotPasswordToken
  );

  await User.findByIdAndUpdate(user.id, {
    $set: {
      forgotPasswordTokens: [...validTokens, forgotPasswordToken],
    },
  });

  return forgotPasswordToken;
};

const verifyForgotPasswordToken = async (token: string): Promise<IUser> => {
  const payload = verify(token, SECRET_FORGOTPASSWORDTOKEN);
  if ((payload as tokenPayload).isForgotPasswordToken !== true)
    throw new Error("Token incorrect");

  const user = await User.findById((payload as tokenPayload).userId);

  if (!user) throw new Error("User does not exist");
  if (!user.forgotPasswordTokens.includes(token))
    throw new Error("Token doesn't exist on user");

  const updatedUser = await User.findByIdAndUpdate(user.id, {
    $set: {
      forgotPasswordTokens: user.forgotPasswordTokens.filter(
        (x) => x !== token
      ),
    },
  });

  if (!updatedUser) throw new Error("User does not exist");
  return updatedUser;
};

export { createForgotPasswordToken, verifyForgotPasswordToken };
