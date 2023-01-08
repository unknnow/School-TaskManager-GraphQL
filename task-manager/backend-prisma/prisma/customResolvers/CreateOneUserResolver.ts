import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { CreateOneUserArgs } from "@generated/resolvers/crud/User/args/CreateOneUserArgs";
import { User } from "@generated/models/User";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "@generated/helpers";

let bcrypt = require('bcryptjs');

export class CreateOneUserResolver {
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