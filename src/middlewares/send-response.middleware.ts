import { Response, Request, NextFunction } from "express";
import ErrorResponse from "../interfaces/error-response.interface";

export function sendResponse(result: ErrorResponse, req: Request, res: Response, next: NextFunction) {
  if (result instanceof Error) {
    next(result);
    return;
  }

  result.message = result.message || res.statusMessage;

  res.json(result);
}
