import { randomBytes } from "crypto";

const generateRandomToken = () =>
  randomBytes(120).toString("base64").replace(/\//gi, "");

export default generateRandomToken;
