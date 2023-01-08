import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { User } from "@generated/models/User";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "@generated/helpers";

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

export class LoginResolver {
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