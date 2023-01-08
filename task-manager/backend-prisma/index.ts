import "reflect-metadata";
import * as TypeGraphQL from "type-graphql";
import { ApolloServer } from "apollo-server";
import { PrismaClient } from "@prisma/client";
import { WebSocketServer } from 'ws';
import cors from 'cors';

import { useServer } from 'graphql-ws/lib/use/ws';
// import { CreateOneTaskResolver, CreateOneAssigneeResolver, CreateOneCommentResolver, UpdateOneTaskResolver, CreateOneNotificationResolver, UpdateOneNotificationResolver, FindUniqueUserResolver, FindManyUserResolver, FindManyTaskResolver, DeleteOneTaskResolver, FindManyCommentResolver } from "@generated/index";
import { resolvers as generatedResolvers } from "@generated/index";

import { RedisPubSub } from 'graphql-redis-subscriptions';

import type { GraphQLResolveInfo } from "graphql";
import { CreateOneUserArgs } from "./prisma/generated/type-graphql/resolvers/crud/User/args/CreateOneUserArgs";
import { User } from "./prisma/generated/type-graphql/models/User";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "./prisma/generated/type-graphql/helpers";

let bcrypt = require('bcryptjs');

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

@TypeGraphQL.InputType("UserWhereUniqueInputLogin", {
  isAbstract: true
})
export class UserWhereUniqueInputLogin {
  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  id?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  email?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  password?: string | undefined;
}


@TypeGraphQL.ArgsType()
export class FindUniqueUserArgsLogin {
  @TypeGraphQL.Field(_type => UserWhereUniqueInputLogin, {
    nullable: false
  })
  where!: UserWhereUniqueInputLogin;
}

class LoginResolver {
  @TypeGraphQL.Mutation(_returns => User, {
    nullable: true
  })
  async loginUser(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindUniqueUserArgsLogin): Promise<User | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);

    return getPrismaFromContext(ctx).user.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}

class CreateOneUserResolver {
  @TypeGraphQL.Mutation(_returns => User, {
    nullable: false
  })
  async createOneUser(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: CreateOneUserArgs): Promise<User> {
    const { _count } = transformInfoIntoPrismaArgs(info);

    // ENCRYPT PASSWORD TO PASSWORD DIGEST
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(args.data.password, salt, function(err, hash) {
        args.data.passwordDigest =  hash;
      });
    });

    return getPrismaFromContext(ctx).user.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}

const resolvers = [
  // CreateOneTaskResolver, CreateOneAssigneeResolver, CreateOneCommentResolver, UpdateOneTaskResolver, CreateOneNotificationResolver, UpdateOneNotificationResolver, CreateOneUserResolver,
  // FindUniqueUserResolver, FindManyUserResolver, FindManyTaskResolver, FindManyCommentResolver,
  // DeleteOneTaskResolver,
  ...generatedResolvers,
  SubscriptionResolver, LoginResolver,
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
