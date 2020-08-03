import mongoose from "mongoose";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import cookieParser from "cookie-parser";
import cors from "cors";

import { FULL_APP_LINK, MONGODB_URL, APP_PORT, IN_PROD } from "./config";
import { UserResolver, UpdatePasswords } from "./resolvers";
import { handleRefreshToken } from "./api";

import { apolloCtx } from "./types/apollo.ctx";
import "reflect-metadata";

(async () => {
  await mongoose.connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });

  const app = express();
  app.use(cookieParser());
  app.use(cors({ origin: FULL_APP_LINK, credentials: true }));

  app.disable("x-powered-by");
  app.disable("etag");

  app.post("/refresh_token", handleRefreshToken);

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, UpdatePasswords],
    }),
    context: ({ req, res }: apolloCtx): apolloCtx => ({ req, res }),
    playground: IN_PROD
      ? false
      : {
          settings: {
            "request.credentials": "include",
            "editor.theme": "light",
          },
        },
  });
  apolloServer.applyMiddleware({ app });

  app.listen(APP_PORT, () => console.log("🚀 Apollo Server - Port", APP_PORT));
})().catch(console.error);
