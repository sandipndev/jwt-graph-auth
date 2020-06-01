import { AuthenticationError } from "apollo-server-express";
import { verify } from "jsonwebtoken";

import { createAccessToken, createRefreshToken } from ".";
import { User, IUser } from "../models";

import { SECRET_ACCESSTOKEN, SECRET_REFRESHTOKEN } from "../config";
import { Request, Response } from "express";
import { MiddlewareFn } from "type-graphql";
import { apolloCtx, tokenPayload } from "../types/apollo.ctx";

export const isAuth: MiddlewareFn<apolloCtx> = ({ context }, next) => {
  const authorization = context.req.headers["authorization"];
  if (!authorization) throw new AuthenticationError("Not authenticated");

  try {
    const token = authorization.split(" ")[1];
    const payload = verify(token, SECRET_ACCESSTOKEN);
    context.payload = payload as tokenPayload;
  } catch {
    throw new AuthenticationError("Bad token");
  }

  return next();
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

    res.send({ ok: true, accessToken: createAccessToken(user) });
  } catch (err) {
    res.send({ ok: false, accessToken: "" });
  }
};

export const addRefreshToken = (res: Response, user: IUser) => {
  res.cookie("jid", createRefreshToken(user), {
    httpOnly: true,
    sameSite: "strict",
    path: "/refresh_token",
  });
};
