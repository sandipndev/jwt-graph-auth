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

const _verifyToken = (token: string, secret: string): boolean => {
  try {
    verify(token, secret);
    return true;
  } catch {
    return false;
  }
};

const _verifyAccessToken = (token: string) =>
  _verifyToken(token, SECRET_ACCESSTOKEN);

const _verifyRefreshToken = (token: string) =>
  _verifyToken(token, SECRET_REFRESHTOKEN);

export const createAccessToken = async (user: IUser): Promise<string> => {
  const accessToken = sign({ userId: user.id }, SECRET_ACCESSTOKEN, {
    expiresIn: EXPIRESIN_ACCESSTOKEN,
  });

  const validTokens = user.whitelistedAccessTokens.filter(_verifyAccessToken);

  await User.findByIdAndUpdate(user.id, {
    $set: {
      whitelistedAccessTokens: [...validTokens, accessToken],
    },
  });

  return accessToken;
};

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

// POST endpoint /refresh_token
export const handleRefreshToken = async (req: Request, res: Response) => {
  const token: string = req.cookies.jid;

  try {
    if (!token) throw Error;

    const payload = verify(token, SECRET_REFRESHTOKEN);

    const user = await User.findOne({ _id: (payload as tokenPayload).userId });
    if (!user) throw Error;

    const userWhitelist = user.whitelistedRefreshTokens;
    if (!userWhitelist.includes(token)) throw Error;

    // sets to db in addRefreshToken
    user.whitelistedRefreshTokens = userWhitelist.filter((x) => x !== token);
    await addRefreshToken(res, user);

    res.send({ ok: true, accessToken: await createAccessToken(user) });
  } catch (err) {
    res.send({ ok: false, accessToken: "" });
  }
};
