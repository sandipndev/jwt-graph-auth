import mongoose from "mongoose";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import "reflect-metadata";

import { MONGODB_URL, APP_PORT } from "./config";
import { UserResolver } from "./resolvers";

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
  });
  apolloServer.applyMiddleware({ app });

  app.listen(APP_PORT, () => console.log("🚀 Apollo Server - Port", APP_PORT));
})();
