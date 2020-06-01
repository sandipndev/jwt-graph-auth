import mongoose from "mongoose";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import "reflect-metadata";

import { MONGODB_URL, APP_PORT, IN_PROD } from "./config";
import { UserResolver } from "./resolvers";
import { apolloCtx } from "./types/apollo.ctx";

(async () => {
  await mongoose.connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
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
})();
