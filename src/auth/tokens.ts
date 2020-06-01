import { IUser, User } from "../models";
import { sign, verify } from "jsonwebtoken";
import {
  SECRET_ACCESSTOKEN,
  SECRET_REFRESHTOKEN,
  EXPIRESIN_REFRESHTOKEN,
  EXPIRESIN_ACCESSTOKEN,
} from "../config";

const _verifyToken = (token: string): boolean => {
  try {
    verify(token, SECRET_ACCESSTOKEN);
    return true;
  } catch {
    return false;
  }
};

export const createAccessToken = async (user: IUser): Promise<string> => {
  const accessToken = sign({ userId: user.id }, SECRET_ACCESSTOKEN, {
    expiresIn: EXPIRESIN_ACCESSTOKEN,
  });

  const validTokens = user.whitelistedAccessTokens.filter(_verifyToken);

  await User.findByIdAndUpdate(user.id, {
    $set: {
      whitelistedAccessTokens: [...validTokens, accessToken],
    },
  });

  return accessToken;
};

export const createRefreshToken = (user: IUser): string =>
  sign({ userId: user.id }, SECRET_REFRESHTOKEN, {
    expiresIn: EXPIRESIN_REFRESHTOKEN,
  });
