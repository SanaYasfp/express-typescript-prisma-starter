import { NextFunction, Request, Response } from "express";
import { appConfig } from "../config";
import buildResponse from "../utils/build-response.util";
import jwt from "jsonwebtoken";
import { CustomRequest } from "../interfaces/custom-request.interface";
import { jwtErrorHandler, Logger } from "../utils";

const constants = appConfig.constants;
const logger = new Logger();

export function authentication(req: CustomRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401);
    next(buildResponse({ message: constants.AUTH_HEADER_MISSED, success: false }));
    return;
  }

  const [bearer, token] = authHeader.split(" ");

  if (!bearer || !token || bearer.toLowerCase() !== 'bearer') {
    res.status(401);
    next(buildResponse({ message: constants.ERR_BEARER_TOKEN, success: false }));
    return;
  }

  try {
    const payload = jwt.verify(token, appConfig.JWT_SECRET);

    if (!payload || typeof payload === "string") {
      res.status(401);
      next(buildResponse({ message: constants.INVALID_TOKEN, success: false }));
      return;
    }

    req.auth = { ...payload.user, };
    next();
  } catch (err) {
    logger.error(err);

    if ((err as any).response)
      logger.error((err as any).response);

    const jwtError = jwtErrorHandler(err);

    if (jwtError) return next(buildResponse({ message: jwtError }));

    return next(err);
  }
}

export function authorization(...roles: (keyof typeof appConfig['ROLES'])[]) {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (roles.length === 0)
      throw new Error('the list of authorisation roles cannot be empty');

    if (!roles.includes(req.auth?.role.toUpperCase() as any)) {
      res.status(403);
      next(buildResponse({ success: false, message: 'Forbidden' }));
      return;
    }

    next();
  }
}
