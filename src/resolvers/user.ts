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
  generateRandomToken,
} from "../tokens";
import { isAuth } from "../auth";

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
    const verificationToken = generateRandomToken();

    const user = await User.create({
      email,
      password,
      whitelistedAccessTokens: [],
      whitelistedRefreshTokens: [],
      verified: false,
      verificationToken,
      forgotPasswordTokens: [],
    });

    sendEmail({
      to: email,
      subject: "Please Verify your Email-Address!",
      templateFile: "emails/verify.ejs",
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

  @Query(() => UserType)
  @UseMiddleware(isAuth)
  async whoami(@Ctx() { user }: apolloCtx): Promise<UserType> {
    if (!user) throw Error;
    return user;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async logout(@Ctx() { res }: apolloCtx): Promise<boolean> {
    res.clearCookie("jid");
    return true;
  }
}

export default UserResolver;
