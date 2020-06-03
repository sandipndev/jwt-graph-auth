import { sign } from "jsonwebtoken";
import { Response } from "express";

import verifyToken from "../utils/verify-token";
import { User, IUser } from "./../models";
import { EXPIRESIN_REFRESHTOKEN, SECRET_REFRESHTOKEN } from "../config";

const _verifyRefreshToken = (token: string) =>
  verifyToken(token, SECRET_REFRESHTOKEN);

export const createRefreshToken = async (user: IUser): Promise<string> => {
  const refreshToken = sign({ userId: user.id }, SECRET_REFRESHTOKEN, {
    expiresIn: EXPIRESIN_REFRESHTOKEN,
  });

  const validTokens = user.whitelistedRefreshTokens.filter(_verifyRefreshToken);

  await User.findByIdAndUpdate(user.id, {
    $set: {
      whitelistedRefreshTokens: [...validTokens, refreshToken],
    },
  });

  return refreshToken;
};

export const addRefreshToken = async (res: Response, user: IUser) => {
  res.cookie("jid", await createRefreshToken(user), {
    httpOnly: true,
    sameSite: "strict",
    path: "/refresh_token",
  });
};
