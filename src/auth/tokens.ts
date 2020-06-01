import { IUser } from "../models";
import { sign } from "jsonwebtoken";
import { SECRET_ACCESSTOKEN, SECRET_REFRESHTOKEN } from "../config";

export const createAccessToken = (user: IUser) =>
  sign({ userId: user.id }, SECRET_ACCESSTOKEN, {
    expiresIn: "15m",
  });

export const createRefreshToken = (user: IUser) =>
  sign({ userId: user.id }, SECRET_REFRESHTOKEN, { expiresIn: "7d" });
