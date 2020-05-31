import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
  ID,
} from "type-graphql";
import { User } from "../models";

@ObjectType()
class UserType {
  @Field(() => ID)
  readonly id: string;

  @Field()
  email: string;
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return "hi!";
  }

  @Query(() => [UserType])
  async users() {
    return await User.find({});
  }

  @Mutation(() => UserType)
  async register(
    @Arg("email") email: string,
    @Arg("password") password: string
  ) {
    const user = await User.create({
      email,
      password,
    });
    return await user.save();
  }
}
