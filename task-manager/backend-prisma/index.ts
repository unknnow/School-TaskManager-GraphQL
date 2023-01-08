import "reflect-metadata";
import * as TypeGraphQL from "type-graphql";
import { ApolloServer } from "apollo-server";
import { PrismaClient } from "@prisma/client";
import { WebSocketServer } from 'ws';
import cors from 'cors';

import { useServer } from 'graphql-ws/lib/use/ws';

import {FindUniqueUserResolver, FindManyUserResolver, FindManyTaskResolver, FindManyCommentResolver} from "@generated/index"
import {TaskRelationsResolver, CommentRelationsResolver, AssigneeRelationsResolver} from "@generated/index"
import {CreateOneTaskResolver, CreateOneAssigneeResolver, CreateOneCommentResolver,  CreateOneNotificationResolver} from "@generated/index"
import {UpdateOneTaskResolver, UpdateOneNotificationResolver} from "@generated/index"
import {DeleteOneTaskResolver, DeleteManyAssigneeResolver, DeleteManyCommentResolver,} from "@generated/index"

import {CreateOneUserResolver} from "./prisma/customResolvers/CreateOneUserResolver"
import {LoginResolver} from "./prisma/customResolvers/LoginUserResolver"

import { RedisPubSub } from 'graphql-redis-subscriptions';

import type { GraphQLResolveInfo } from "graphql";
import { CreateOneNotificationArgs } from "@generated/resolvers/crud/Notification/args/CreateOneNotificationArgs";

import { User } from "@generated/models/User";
import { Notification } from "@generated/models/Notification";

import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "@generated/helpers";

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


class NotificationSubscriptionResolver {
  @TypeGraphQL.Subscription({
    topics: ["NOTIFICATIONS"],
    subscribe: () => pubSub.asyncIterator('NOTIFICATIONS'),
  })
  newNotif(@TypeGraphQL.Root() payload: any): String {
    console.log("SUBSCRIPTION TRIGGER ! - NOTIFICATIONS")
    console.log(`RECEIVED :  ${JSON.stringify(payload)}`)
    return 'NewNotif';
  };

  @TypeGraphQL.Mutation(_returns => Notification, {
    nullable: false
  })
  async createOneNotificationAndAction(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: CreateOneNotificationArgs): Promise<Notification> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    await pubSub.publish("NOTIFICATIONS", args.data)

    return getPrismaFromContext(ctx).notification.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}

const resolvers = [
  FindUniqueUserResolver, FindManyUserResolver, FindManyTaskResolver, FindManyCommentResolver,
  CreateOneTaskResolver, CreateOneAssigneeResolver, CreateOneCommentResolver,  CreateOneNotificationResolver, CreateOneUserResolver,
  UpdateOneTaskResolver, UpdateOneNotificationResolver,
  TaskRelationsResolver, CommentRelationsResolver, AssigneeRelationsResolver,
  DeleteOneTaskResolver, DeleteManyAssigneeResolver, DeleteManyCommentResolver,
  LoginResolver,
  NotificationSubscriptionResolver, SubscriptionResolver,
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
