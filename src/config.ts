import dotenv from "dotenv";
dotenv.config();

export const {
  // App
  APP_PORT = 4000,
  NODE_ENV = "development",

  // UI
  HTTPS = "false",
  UI_HOST = "localhost",
  UI_PORT = "3000",

  // MongoDB
  DB_USER = "",
  DB_PASS = "",
  DB_HOST = "localhost",
  DB_PORT = 27017,
  DB_NAME = "",
  DB_AUTHSOURCE = "", // Authentication Database

  // BCRYPT SALT WORK - Crypto
  SALT_WORK_FACTOR = 10,

  // JWT Secrets and Expirytime
  SECRET_ACCESSTOKEN = "secret-access",
  SECRET_REFRESHTOKEN = "secret-refresh",
  SECRET_OTHERTOKENS = "secret-othertokens",
  EXPIRESIN_ACCESSTOKEN = "15m",
  EXPIRESIN_REFRESHTOKEN = "7d",
  EXPIRESIN_FORGOTPASSWORDTOKEN = "1d",
  EXPIRESIN_EMAILVERIFICATIONTOKEN = "1d",

  // SMTP Account - for emails
  SMTP_HOST = "",
  SMTP_PORT = 587,
  SMTP_SECURE = "false",
  SMTP_AUTH_USER = "",
  SMTP_AUTH_PASS = "",
  EMAIL_FROM = "",
} = process.env;

// Computed
export const IN_PROD = NODE_ENV === "production";

export const MONGODB_URL = `mongodb://${
  DB_USER && `${DB_USER}:${DB_PASS}@`
}${DB_HOST}:${DB_PORT}/${DB_NAME}${
  DB_AUTHSOURCE && `?authSource=${DB_AUTHSOURCE}`
}`;

export const FULL_APP_LINK = `${
  HTTPS === "true" ? "https" : "http"
}://${UI_HOST}${UI_PORT && `:${UI_PORT}`}`;

export const getTransportConfig = () => {
  return {
    host: SMTP_HOST,
    port: parseInt(String(SMTP_PORT)),
    secure: SMTP_SECURE === "true",
    auth: {
      user: SMTP_AUTH_USER,
      pass: SMTP_AUTH_PASS,
    },
  };
};
