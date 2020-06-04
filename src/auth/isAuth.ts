import { AuthenticationError } from "apollo-server-express";
import { verify } from "jsonwebtoken";

import { User } from "../models";

import { SECRET_ACCESSTOKEN } from "../config";
import { MiddlewareFn } from "type-graphql";
import { apolloCtx } from "../types/apollo.ctx";

import { tokenPayload } from "../types/token.payload";

const isAuth: MiddlewareFn<apolloCtx> = async ({ context }, next) => {
  const authorization = context.req.headers["authorization"];
  if (!authorization) throw new AuthenticationError("Not authenticated");

  try {
    const token = authorization.split(" ")[1];
    const payload = verify(token, SECRET_ACCESSTOKEN) as tokenPayload;

    const user = await User.findById(payload.userId);
    if (!user) throw new AuthenticationError("Unauthorized user");

    const userWhitelist = user.whitelistedAccessTokens;
    if (!userWhitelist.includes(token))
      throw new AuthenticationError("Bad token");

    context.user = user;
    context.tokenPayload = payload;
  } catch {
    throw new AuthenticationError("Bad token");
  }

  return next();
};

export default isAuth;
