import { verify } from "jsonwebtoken";

const verifyToken = (token: string, secret: string): boolean => {
  try {
    verify(token, secret);
    return true;
  } catch {
    return false;
  }
};

export default verifyToken;
