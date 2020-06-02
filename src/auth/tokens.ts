import { IUser, User } from "../models";
import { sign, verify } from "jsonwebtoken";

import {
  SECRET_ACCESSTOKEN,
  SECRET_REFRESHTOKEN,
  EXPIRESIN_REFRESHTOKEN,
  EXPIRESIN_ACCESSTOKEN,
} from "../config";

import { Request, Response } from "express";
import { tokenPayload } from "../types/token.payload";

const _verifyToken = (token: string): boolean => {
  try {
    verify(token, SECRET_ACCESSTOKEN);
    return true;
  } catch {
    return false;
  }
};

export const createAccessToken = async (user: IUser): Promise<string> => {
  const accessToken = sign({ userId: user.id }, SECRET_ACCESSTOKEN, {
    expiresIn: EXPIRESIN_ACCESSTOKEN,
  });

  const validTokens = user.whitelistedAccessTokens.filter(_verifyToken);

  await User.findByIdAndUpdate(user.id, {
    $set: {
      whitelistedAccessTokens: [...validTokens, accessToken],
    },
  });

  return accessToken;
};

export const createRefreshToken = (user: IUser): string =>
  sign({ userId: user.id }, SECRET_REFRESHTOKEN, {
    expiresIn: EXPIRESIN_REFRESHTOKEN,
  });

export const addRefreshToken = (res: Response, user: IUser) => {
  res.cookie("jid", createRefreshToken(user), {
    httpOnly: true,
    sameSite: "strict",
    path: "/refresh_token",
  });
};

// POST endpoint /refresh_token
export const handleRefreshToken = async (req: Request, res: Response) => {
  const token: string = req.cookies.jid;
  if (!token) res.send({ ok: false, accessToken: "" });

  try {
    const payload = verify(token, SECRET_REFRESHTOKEN);

    const user = await User.findOne({ _id: (payload as tokenPayload).userId });
    if (!user) throw Error;

    addRefreshToken(res, user);

    res.send({ ok: true, accessToken: await createAccessToken(user) });
  } catch (err) {
    res.send({ ok: false, accessToken: "" });
  }
};
