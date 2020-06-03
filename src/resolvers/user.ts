import { randomBytes } from "crypto";
import { AuthenticationError } from "apollo-server-express";
import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
  ID,
  Ctx,
  UseMiddleware,
} from "type-graphql";

import { User } from "../models";
import { createAccessToken, addRefreshToken } from "../auth";
import { isAuth } from "../auth";

import { sendEmail } from "../utils/mailer";
import { FULL_APP_LINK } from "../config";

import { apolloCtx } from "../types/apollo.ctx";

@ObjectType("UserType")
class UserType {
  @Field(() => ID)
  readonly id: string;

  @Field()
  email: string;
}

@ObjectType("LoginResponse")
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
  async users(): Promise<Array<UserType>> {
    return await User.find({});
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  hey(@Ctx() ctx: apolloCtx) {
    return "Hey, your id: " + ctx.user?.id;
  }

  @Mutation(() => UserType)
  async register(
    @Arg("email") email: string,
    @Arg("password") password: string
  ): Promise<UserType> {
    const verifyToken = randomBytes(120).toString("base64");

    const user = await User.create({
      email,
      password,
      whitelistedAccessTokens: [],
      whitelistedRefreshTokens: [],
      verified: false,
      verifyToken,
    });

    sendEmail({
      to: email,
      subject: "Please Verify your Email-Address!",
      templateFile: "emails/verify-email.ejs",
      completeVerificationLink: `${FULL_APP_LINK}/verify/?id=${user.id}&&token=${verifyToken}`,
    }).then(() => {});

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
    await addRefreshToken(res, user);

    return {
      accessToken: await createAccessToken(user),
    };
  }

  async logout() {}
  async updatePassword() {}
}
