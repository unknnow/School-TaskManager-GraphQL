import * as TypeGraphQL from "type-graphql";

@TypeGraphQL.ArgsType()
class PublishMessageMutationArgs {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  message!: String;
}


export class SubscriptionResolver {
  @TypeGraphQL.Subscription({
    topics: ["NOTIFICATIONS", "ERRORS"],
  })
  readMessage(
    @TypeGraphQL.Root() payload: any,
  ): String {
    console.log(`Received: ${JSON.stringify(payload)}`)
    return payload.message;
  };
  @TypeGraphQL.Mutation(_returns => Boolean, {
    nullable: true
  })
  async publishMessage(@TypeGraphQL.PubSub() pubSub: TypeGraphQL.PubSubEngine, @TypeGraphQL.Args() args: PublishMessageMutationArgs): Promise<Boolean | null> {
    await pubSub.publish('NOTIFICATIONS', { message: args.message });

    return true;
  }
}
