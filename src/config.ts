export const {
  // App
  APP_PORT = 4000,
  NODE_ENV = "development",

  // MongoDB
  DB_USER = "jwt-test",
  DB_PASS = "jwt-test",
  DB_HOST = "localhost",
  DB_PORT = 27017,
  DB_NAME = "jwt-test",
  DB_AUTHSOURCE = "jwt-test", // Authentication Database
} = process.env;

// Computed
export const IN_PROD = NODE_ENV === "production";
export const MONGODB_URL = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=${DB_AUTHSOURCE}`;
