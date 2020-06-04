import { FULL_APP_LINK } from "./../config";
import { Resolver, Mutation, Arg, UseMiddleware, Ctx } from "type-graphql";
import { AuthenticationError } from "apollo-server-express";
import { User } from "../models";
import {
  createForgotPasswordToken,
  verifyForgotPasswordToken,
  createAccessToken,
} from "../tokens";
import { isAuth, isVerified } from "../auth";
import { apolloCtx } from "../types/apollo.ctx";
import { sendEmail } from "../utils/mailer";
import { LoginResponse } from "../types/user-resolver.types";

@Resolver()
class UpdatePasswords {
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  @UseMiddleware(isVerified)
  async changePassword(
    @Arg("oldPassword") oldPassword: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { user }: apolloCtx
  ): Promise<boolean> {
    if (!user) throw Error;

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
      templateFile: "emails/password-changed.ejs",
      templateData: {
        email,
      },
    }).then(() => {});

    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  @UseMiddleware(isVerified)
  async changePasswordWithoutOldPassword(
    @Arg("newPassword") newPassword: string,
    @Ctx() { user, tokenPayload }: apolloCtx
  ): Promise<boolean> {
    if (!user) throw Error;
    if (!tokenPayload?.allowChangePasswordWithoutOld)
      throw new Error("Bad token");

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    const { email } = user;
    sendEmail({
      to: email,
      subject: "Password Changed Successfully!",
      templateFile: "emails/password-changed.ejs",
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

    const forgotPasswordToken = await createForgotPasswordToken(user);
    sendEmail({
      to: user.email,
      subject: "Forgot Password? No Worries",
      templateFile: "emails/forgot-password.ejs",
      templateData: {
        completeForgotPasswordTokenLink: `${FULL_APP_LINK}/forgot-password/${forgotPasswordToken}`,
      },
    }).then(() => {});

    return true;
  }

  @Mutation(() => LoginResponse)
  async forgotPasswordVerify(
    @Arg("forgotPasswordToken") forgotPasswordToken: string
  ): Promise<LoginResponse> {
    const user = await verifyForgotPasswordToken(forgotPasswordToken);
    const accessToken = await createAccessToken(user, true);

    const { id, email, verified } = user;
    return {
      id,
      email,
      verified,
      accessToken,
    };
  }
}

export default UpdatePasswords;
