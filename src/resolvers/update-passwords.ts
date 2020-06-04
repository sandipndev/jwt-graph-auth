import { Resolver, Mutation, Arg, UseMiddleware, Ctx } from "type-graphql";
import { AuthenticationError } from "apollo-server-express";
import { User } from "../models";
import { generateRandomToken } from "../tokens";
import { isAuth, isVerified } from "../auth";
import { apolloCtx } from "../types/apollo.ctx";
import { sendEmail } from "../utils/mailer";

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

export default UpdatePasswords;
