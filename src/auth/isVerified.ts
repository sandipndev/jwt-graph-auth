import { apolloCtx } from "../types/apollo.ctx";
import { MiddlewareFn } from "type-graphql";
import { AuthenticationError } from "apollo-server-express";

const isVerified: MiddlewareFn<apolloCtx> = async ({ context }, next) => {
  const { user } = context;

  if (!user?.verified) throw new AuthenticationError("Email ID not verified");

  return next();
};

export default isVerified;
