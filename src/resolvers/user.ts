import { AuthenticationError } from "apollo-server-express";
import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  UseMiddleware,
} from "type-graphql";

import { UserType, LoginResponse } from "../types/user-resolver.types";

import { User } from "../models";
import {
  createAccessToken,
  addRefreshToken,
  generateRandomToken,
} from "../tokens";
import { isAuth, isVerified } from "../auth";

import { sendEmail } from "../utils/mailer";
import { FULL_APP_LINK } from "../config";

import { apolloCtx } from "../types/apollo.ctx";

@Resolver()
export class UserResolver {
  /* === APIS FOR TESTING === */
  @Query(() => [UserType])
  async users(): Promise<Array<UserType>> {
    return await User.find({});
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  hey(@Ctx() { user }: apolloCtx) {
    return "Hey, your id: " + user?.id;
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  @UseMiddleware(isVerified)
  hola(@Ctx() { user }: apolloCtx) {
    return "Only when verified. Hola, your id: " + user?.id;
  }

  /* === APIS FOR PRODUCTION === */
  @Mutation(() => UserType)
  async register(
    @Arg("email") email: string,
    @Arg("password") password: string
  ): Promise<UserType> {
    const verificationToken = generateRandomToken();
    const forgotPasswordToken = generateRandomToken();

    const user = await User.create({
      email,
      password,
      whitelistedAccessTokens: [],
      whitelistedRefreshTokens: [],
      verified: false,
      verificationToken,
      forgotPasswordToken,
    });

    sendEmail({
      to: email,
      subject: "Please Verify your Email-Address!",
      templateFile: "pages/verify-email.ejs",
      templateData: {
        completeVerificationLink: `${FULL_APP_LINK}/verify/${user.id}/${verificationToken}`,
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

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async logout(@Ctx() { res }: apolloCtx): Promise<boolean> {
    res.clearCookie("jid");
    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  @UseMiddleware(isVerified)
  async changePassword(
    @Arg("oldPassword") oldPassword: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { user }: apolloCtx
  ): Promise<boolean> {
    if (!user) return false;

    if (!(await user.comparePassword(oldPassword)))
      throw new AuthenticationError("Old Password Incorrect");

    if (oldPassword === newPassword)
      throw new AuthenticationError("Both Passwords Same");

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    const { email } = user;
    sendEmail({
      to: email,
      subject: "Password Changed Successfully!",
      templateFile: "pages/passwordchanged-email.ejs",
      templateData: {
        email,
      },
    }).then(() => {});

    return true;
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Arg("email") email: string): Promise<boolean> {
    const user = await User.findOne({ email });
    if (!user) throw new AuthenticationError("Could not find user");

    const forgotPasswordToken = generateRandomToken();
    await User.findByIdAndUpdate(user.id, {
      $set: {
        forgotPasswordToken,
      },
    });

    return true;
  }
}
