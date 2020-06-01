import { Request, Response } from "express";

export interface tokenPayload {
  userId: string;
}

export interface apolloCtx {
  req: Request;
  res: Response;
  payload?: tokenPayload;
}
