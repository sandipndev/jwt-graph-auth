import { Request, Response } from "express";

export interface apolloCtx {
  req: Request;
  res: Response;
}
