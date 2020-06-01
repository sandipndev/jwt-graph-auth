import { MiddlewareFn } from "type-graphql";
import { apolloCtx, tokenPayload } from "../types/apollo.ctx";
import { AuthenticationError } from "apollo-server-express";
import { verify } from "jsonwebtoken";
import { SECRET_ACCESSTOKEN } from "../config";

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
