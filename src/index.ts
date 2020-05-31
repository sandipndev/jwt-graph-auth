import mongoose from "mongoose";
import express from "express";
import { ApolloServer, gql } from "apollo-server-express";

import { MONGODB_URL, APP_PORT } from "./config";

(async () => {
  await mongoose.connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const app = express();

  const apolloServer = new ApolloServer({
    typeDefs: gql`
      type Query {
        hello: String!
      }
    `,
    resolvers: {
      Query: {
        hello: () => "hi",
      },
    },
  });
  apolloServer.applyMiddleware({ app });

  app.listen(APP_PORT, () => console.log("🚀 Apollo Server - Port", APP_PORT));
})();
