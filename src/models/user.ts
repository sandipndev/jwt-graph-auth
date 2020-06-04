import { Document, Schema, Model, model } from "mongoose";
import { compare, hash, genSalt } from "bcryptjs";

import { SALT_WORK_FACTOR } from "../config";
const _SALT_WORK_FACTOR = parseInt(String(SALT_WORK_FACTOR));

export interface IUserDocument extends Document {
  id: string;
  email: string;
  password: string;
  whitelistedAccessTokens: Array<string>;
  whitelistedRefreshTokens: Array<string>;
  verified: boolean;
  verificationToken: string;
  forgotPasswordTokens: Array<string>;
}

// methods
export interface IUser extends IUserDocument {
  comparePassword: (candidatePw: string) => Promise<boolean>;
}

// statics
export interface IUserModel extends Model<IUser> {
  checkUnique: (field: string, value: any) => Promise<boolean>;
}

const userSchema = new Schema({
  email: {
    type: String,
    validate: {
      validator: (email: string): Promise<boolean> =>
        User.checkUnique("email", email),
      message: ({ value }) => `Account with email ${value} already exists`,
    },
  },
  password: String,
  whitelistedAccessTokens: [String],
  whitelistedRefreshTokens: [String],
  verified: Boolean,
  verificationToken: String,
  forgotPasswordTokens: [String],
});

userSchema.pre<IUser>("save", async function (next) {
  const user = this;
  const salt = await genSalt(_SALT_WORK_FACTOR);
  const hashedPassword = await hash(user.password, salt);
  user.password = hashedPassword;

  next();
});

userSchema.statics.checkUnique = async function (field: string, value: any) {
  return (await this.where(field).equals(value).countDocuments()) === 0;
};

userSchema.methods.comparePassword = async function (candidatePw: string) {
  return await compare(candidatePw, this.password);
};

const User: IUserModel = model<IUser, IUserModel>("User", userSchema);
export default User;
