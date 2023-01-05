import "reflect-metadata";
import * as TypeGraphQL from "type-graphql";
import { ApolloServer } from "apollo-server";
import { PrismaClient } from "@prisma/client";
import { WebSocketServer } from 'ws';
import cors from 'cors';

import { useServer } from 'graphql-ws/lib/use/ws';
import { resolvers as generatedResolvers } from "@generated/index";

import { RedisPubSub } from 'graphql-redis-subscriptions';

interface Context {
  prisma: PrismaClient;
}

const pubSub = new RedisPubSub({
  messageEventName: 'messageBuffer',
  pmessageEventName: 'pmessageBuffer',
});

class SubscriptionResolver {
  @TypeGraphQL.Subscription({
    topics: ["NOTIFICATIONS", "ERRORS"],
    subscribe: () => pubSub.asyncIterator('NOTIFICATIONS'),
  })
  hello(): String {
    return 'hello';
  };
}

const resolvers = [
  ...generatedResolvers,
  SubscriptionResolver,
] as TypeGraphQL.NonEmptyArray<Function>;

async function main() {
  const schema = await TypeGraphQL.buildSchema({
    resolvers,
    pubSub,
    emitSchemaFile: "./generated-schema.graphql",
    validate: false,
  });

  const prisma = new PrismaClient();
  const server = new ApolloServer({
    schema,
    context: (): Context => ({ prisma }),
    introspection: true,
    cors: {
      origin: ['http://localhost:8000', 'https://studio.apollographql.com'],
      credentials: true,
    },
  });
  const wsServer = new WebSocketServer({
    server: server.httpServer,
    path: '/subscriptions',
  });
  const serverCleanup = useServer({ schema }, wsServer);

  const { port } = await server.listen(4000);
  console.log(`GraphQL is listening on ${port}!`);
}

main().catch(console.error);
