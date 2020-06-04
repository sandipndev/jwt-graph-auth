import { sign } from "jsonwebtoken";

import verifyToken from "../utils/verify-token";
import { User, IUser } from "./../models";
import { EXPIRESIN_ACCESSTOKEN, SECRET_ACCESSTOKEN } from "../config";

const _verifyAccessToken = (token: string) =>
  verifyToken(token, SECRET_ACCESSTOKEN);

export const createAccessToken = async (
  user: IUser,
  allowChangePasswordWithoutOld = false
): Promise<string> => {
  const extras = allowChangePasswordWithoutOld
    ? { allowChangePasswordWithoutOld: true }
    : {};

  const accessToken = sign({ userId: user.id, ...extras }, SECRET_ACCESSTOKEN, {
    expiresIn: EXPIRESIN_ACCESSTOKEN,
  });

  const validTokens = user.whitelistedAccessTokens.filter(_verifyAccessToken);

  await User.findByIdAndUpdate(user.id, {
    $set: {
      whitelistedAccessTokens: [...validTokens, accessToken],
    },
  });

  return accessToken;
};
