import { createRefreshToken, addRefreshToken } from "./refresh.token";
import { createAccessToken } from "./access.token";
import {
  createForgotPasswordToken,
  verifyForgotPasswordToken,
} from "./forgot-password.token";
import generateRandomToken from "./random.token";

export {
  createRefreshToken,
  createAccessToken,
  addRefreshToken,
  createForgotPasswordToken,
  verifyForgotPasswordToken,
  generateRandomToken,
};
