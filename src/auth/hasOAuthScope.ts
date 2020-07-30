import { apolloCtx } from "../types/apollo.ctx";
import { MiddlewareFn } from "type-graphql";
import { ForbiddenError } from "apollo-server-express";

const hasOAuthScope = (scope: string): MiddlewareFn<apolloCtx> => async (
  { context },
  next
) => {
  const { user } = context;

  if (!user?.oAuthScope.includes(scope))
    throw new ForbiddenError("Invalid Permissions");

  return next();
};

export default hasOAuthScope;
