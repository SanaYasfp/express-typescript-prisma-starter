import { PrismaClient } from "@prisma/client";
import express from "express";
import * as Joi from 'joi';
import jwt from "jsonwebtoken";
import { appConfig } from "../../config";
import FieldError from "../../interfaces/field-error.interface";
import { dtoValidator, getAccess, handlePrismaError, HasherHelper, jwtErrorHandler, Logger } from "../../utils";

import buildResponse from "../../utils/build-response.util";

const router = express.Router();
const logger = new Logger();
const constants = appConfig.constants;

router.post('/refresh-access', async (req, res, next) => {
  const schema = Joi.object({
    access_token: Joi.string().trim().required(),
    refresh_token: Joi.string().trim().required(),
  });

  try {
    const { errors, result } = await dtoValidator<{
      access_token: string;
      refresh_token: string;
    }>(schema, req.body);

    if (errors || !result) {
      res.status(400);
      next(buildResponse({
        message: 'Need refresh token and access token to refresh access',
        success: false,
        errors: errors as FieldError[]
      }));
      return;
    }

    const prismaClient = new PrismaClient();
    const { access_token, refresh_token } = result;
    const payload = jwt.decode(access_token);

    if (!payload || typeof payload === 'string') {
      res.status(400);
      next(buildResponse({ message: 'Bad access token!', success: false }));
      return;
    }

    const { user: { id }, position, session_exp = Date.now() } = payload;
    const user = await prismaClient.users.findFirst({ where: { id } });

    if (!user) {
      res.status(403);
      next(buildResponse({ success: false, message: 'Forbidden' }));
      return;
    }

    logger.debug(user);

    const secret = position > 0
      ? `${appConfig.JWT_SECRET}${access_token}${user.password}${user.email}${user.role}`
      : `${access_token}${appConfig.JWT_SECRET}${user.password}${user.email}${user.role}`;

    const testRefreshToken = (await HasherHelper.hmac(access_token, secret, { encodings: ['base64url'] })).base64url;

    if (testRefreshToken !== refresh_token) {
      res.status(401);
      next(buildResponse({ success: false, message: 'Unauthorized' }));
      return;
    }

    const { accessToken, refreshToken } = await getAccess(user);

    next(buildResponse({
      message: 'Access updated',
      data: [{ token_type: "Bearer", access_token: accessToken, refresh_token: refreshToken }],
    }));
    return;
  } catch (err) {
    const errors = handlePrismaError(err, logger);

    if (errors.length > 0)
      return next(buildResponse({
        message: "Conflict in database.",
        errors
      }));
    else {
      logger.error(err);

      if ((err as any).response)
        logger.error((err as any).response);

      const jwtError = jwtErrorHandler(err);

      if (jwtError) return next(buildResponse({ message: jwtError }));

      return next(err);
    }
  }
});

export default router;
