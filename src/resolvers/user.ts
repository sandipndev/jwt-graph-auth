import { AuthenticationError } from "apollo-server-express";
import {
  Resolver,
  Mutation,
  Arg,
  Ctx,
  UseMiddleware,
  Query,
} from "type-graphql";

import { UserType, LoginResponse } from "../types/user-resolver.types";

import { User } from "../models";
import {
  createAccessToken,
  addRefreshToken,
  createEmailVerificationToken,
  verifyEmailVerificationToken,
} from "../tokens";
import { isAuth, isVerified } from "../auth";

import { sendEmail } from "../utils/mailer";
import { FULL_APP_LINK } from "../config";

import { apolloCtx } from "../types/apollo.ctx";

@Resolver()
class UserResolver {
  /* === APIS FOR PRODUCTION === */
  @Mutation(() => UserType)
  async register(
    @Arg("email") email: string,
    @Arg("password") password: string
  ): Promise<UserType> {
    const user = await User.create({
      email,
      password,
      whitelistedAccessTokens: [],
      whitelistedRefreshTokens: [],
      verified: false,
      emailVerificationToken: "",
      forgotPasswordTokens: [],
      oAuthScope: [],
    });

    const emailVerifiationToken = await createEmailVerificationToken(user);

    sendEmail({
      to: email,
      subject: "Please Verify your Email-Address!",
      templateFile: "emails/verify.ejs",
      templateData: {
        completeVerificationLink: `${FULL_APP_LINK}/verify/${emailVerifiationToken}`,
      },
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

    const { id, verified } = user;
    return {
      id,
      email,
      verified,
      accessToken: await createAccessToken(user),
    };
  }

  @Query(() => UserType)
  @UseMiddleware(isAuth)
  async whoami(@Ctx() { user }: apolloCtx): Promise<UserType> {
    if (!user) throw Error;
    return user;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async logout(@Ctx() { res }: apolloCtx): Promise<boolean> {
    res.clearCookie("jid", { path: "/refresh_token" });
    return true;
  }

  @Mutation(() => Boolean)
  async verifyEmail(@Arg("token") token: string): Promise<boolean> {
    const user = await verifyEmailVerificationToken(token);

    if (!user) throw new Error("User not found");
    const { email } = user;

    if (!user.verified) {
      sendEmail({
        to: email,
        templateFile: "emails/verified.ejs",
        subject: "Congratulations, your email has been verified!",
        templateData: { email },
      }).then(() => {});
    }

    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  @UseMiddleware(isVerified)
  async logMeOutOfAllDevices(@Ctx() { user }: apolloCtx): Promise<boolean> {
    if (!user) throw Error;

    await User.findByIdAndUpdate(user.id, {
      $set: {
        whitelistedRefreshTokens: [],
        whitelistedAccessTokens: [],
      },
    });

    return true;
  }
}

export default UserResolver;
