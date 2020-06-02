import { AuthenticationError } from "apollo-server-express";
import { verify } from "jsonwebtoken";

import { User } from "../models";

import { SECRET_ACCESSTOKEN } from "../config";
import { MiddlewareFn } from "type-graphql";
import { apolloCtx } from "../types/apollo.ctx";

import { tokenPayload } from "../types/token.payload";

export const isAuth: MiddlewareFn<apolloCtx> = async ({ context }, next) => {
  const authorization = context.req.headers["authorization"];
  if (!authorization) throw new AuthenticationError("Not authenticated");

  try {
    const token = authorization.split(" ")[1];
    const payload = verify(token, SECRET_ACCESSTOKEN) as tokenPayload;
    const user = await User.findById(payload.userId);
    if (!user) throw new AuthenticationError("Unauthorized user");
    context.user = user;
  } catch {
    throw new AuthenticationError("Bad token");
  }

  return next();
};
