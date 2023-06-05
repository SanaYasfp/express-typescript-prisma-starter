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

router.post('/login', async (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().trim().lowercase().email(),
    magicLink: Joi.string().trim(),
    password: Joi.string().trim(),
  })
    .with("email", "password")
    .xor("magicLink", "email")
    .xor("magicLink", "password");

  try {
    const { errors, result } = await dtoValidator<{
      magicLink: string;
      email: string;
      password: string;
    }>(schema, req.body);

    if (errors || !result) {
      res.status(400);
      next(buildResponse({ message: 'Complete all fields correctly.', errors: errors as FieldError[] }));
      return;
    }

    const prismaClient = new PrismaClient();
    const { magicLink, email, password } = result;
    let refreshToken: string = "";
    let accessToken: string = "null";

    // LOGIN WITH MAGIC LINK
    if (magicLink) {
      const token = Buffer.from(magicLink, "base64url").toString("utf-8");
      const decodedToken = jwt.verify(token, appConfig.JWT_SECRET);

      if (typeof decodedToken === "string") {
        res.status(400);
        buildResponse({ message: constants.INVALID_TOKEN, success: false });
        return;
      }

      const user = await prismaClient.users.update({
        where: { id: decodedToken.user_id },
        data: { email_verified: true, account_activated: true }
      });
      const access = await getAccess(user);
      refreshToken = access.refreshToken;
      accessToken = access.accessToken;
    }
    // LOGIN WITH EMAIL AND PASSWORD
    else {
      const user = await prismaClient.users.findFirst({ where: { email } });

      if (!user) {
        res.status(404);
        next(buildResponse({ success: false, message: 'Email or password are incorrect!', }));
        return;
      }

      const checkPassword = await HasherHelper.bcryptCompare(password, user.password);

      if (!checkPassword) {
        res.status(401);
        next(buildResponse({ success: false, message: 'Email or password are incorrect!', }));
        return;
      }

      if (!user.account_activated) {
        res.status(401);
        next(buildResponse({
          success: false,
          message: 'Account deactivated! Take look at your emails or contact us for more information about the reason!',
        }));
        return;
      }

      const access = await getAccess(user);
      refreshToken = access.refreshToken;
      accessToken = access.accessToken;
    }

    next(buildResponse({
      message: 'Login successful!',
      data: [{ token_type: "Bearer", access_token: accessToken, refresh_token: refreshToken }],
    }));
    return;
  } catch (err) {
    const errors = handlePrismaError(err, logger);

    if (errors.length > 0)
      return next(buildResponse({
        success: false,
        message: "Conflict in database.",
        errors
      }));
    else {
      logger.error(err);

      if ((err as any).response)
        logger.error((err as any).response);

      const jwtError = jwtErrorHandler(err);

      if (jwtError) return next(buildResponse({ success: false, message: jwtError }));

      return next(err);
    }
  }
});

export default router;
