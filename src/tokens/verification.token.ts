import { randomBytes } from "crypto";

const generateVerificationToken = () =>
  randomBytes(120).toString("base64").replace(/\//gi, "");

export default generateVerificationToken;
