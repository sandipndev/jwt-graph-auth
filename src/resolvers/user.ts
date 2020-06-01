import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
  ID,
  Ctx,
} from "type-graphql";
import { User } from "../models";

import { AuthenticationError } from "apollo-server-express";
import { apolloCtx } from "../types/apollo.ctx";
import { createRefreshToken, createAccessToken } from "../auth";

@ObjectType()
class UserType {
  @Field(() => ID)
  readonly id: string;

  @Field()
  email: string;
}

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
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
  ): Promise<UserType> {
    const user = await User.create({
      email,
      password,
    });
    return user;
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { res }: apolloCtx
  ): Promise<LoginResponse> {
    const user = await User.findOne({ email });
    if (!user) throw new AuthenticationError("Could not find User");

    const valid = await user.comparePassword(password);
    if (!valid) throw new AuthenticationError("Bad Password");

    // login successful - give tokens
    res.cookie("jid", createRefreshToken(user), { httpOnly: true });

    return {
      accessToken: createAccessToken(user),
    };
  }
}
