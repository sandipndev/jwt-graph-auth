import { Request, Response } from "express";
import { IUser } from "../models";

export interface apolloCtx {
  req: Request;
  res: Response;
  user?: IUser;
}
