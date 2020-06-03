import { verify } from "jsonwebtoken";
import { Request, Response } from "express";

import { createAccessToken } from "../tokens";
import { tokenPayload } from "../types/token.payload";
import { User } from "../models";

import { addRefreshToken } from "../tokens";
import { SECRET_REFRESHTOKEN } from "../config";

// POST endpoint /refresh_token
export const handleRefreshToken = async (req: Request, res: Response) => {
  const token: string = req.cookies.jid;

  try {
    if (!token) throw Error;

    const payload = verify(token, SECRET_REFRESHTOKEN);

    const user = await User.findOne({ _id: (payload as tokenPayload).userId });
    if (!user) throw Error;

    const userWhitelist = user.whitelistedRefreshTokens;
    if (!userWhitelist.includes(token)) throw Error;

    // sets to db in addRefreshToken
    user.whitelistedRefreshTokens = userWhitelist.filter((x) => x !== token);
    await addRefreshToken(res, user);

    res.send({ ok: true, accessToken: await createAccessToken(user) });
  } catch (err) {
    res.send({ ok: false, accessToken: "" });
  }
};
