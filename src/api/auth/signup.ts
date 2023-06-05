import { Prisma, PrismaClient, Users } from "@prisma/client";
import express from "express";
import * as Joi from 'joi';
import { appConfig } from "../../config";
import FieldError from "../../interfaces/field-error.interface";
import { dtoValidator, handlePrismaError, HasherHelper, jwtErrorHandler, Logger, sendMagicLink } from "../../utils";

import buildResponse from "../../utils/build-response.util";

const router = express.Router();
const logger = new Logger();

router.post('/signup', async (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().trim().lowercase().email().required(),
    phone_number: Joi.string()
      .trim()
      .required()
      .regex(/(^\+[1-9][0-9]{0,2}[ ]?[0-9]{8,12}$)|(^\+[1-9]{1,2}-[0-9]{3}[ ]?[0-9]{8,12}$)/)
      .label('phone number')
      .messages({
        'string.pattern.base': 'Phone number example: +225 0001112222/+2250001112222',
      }),
    password: Joi.string()
      .trim()
      .required()
      //.regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{10,})/)
      .messages({ "string.pattern.base": "Give a strong password for more security." }),
  });


  try {
    const { errors, result } = await dtoValidator<Users>(schema, req.body);

    if (errors || !result) {
      res.status(400);
      next(buildResponse({ success: false, message: 'Complete all fields correctly.', errors: errors as FieldError[] }));
      return;
    }

    const prismaClient = new PrismaClient();
    //const role = await prismaClient.roles.findFirst({ where: { name: appConfig.ROLES.LENDER } });

    //if (!role) {
    //  res.status(500);
    //  next(buildResponse({ success: false, message: 'Failed to create lender.' }));
    //  logger.error("Role lender is not set!");
    //  return;
    //}

    const passwordHash = await HasherHelper.bcryptHash(result.password);
    const newUser = await prismaClient.users.create({ data: { ...result, password: passwordHash, role: appConfig.ROLES.LENDER } });

    logger.debug("New user registered successfully!");

    await sendMagicLink(newUser.id, result.email);

    logger.debug("Activation account email sent");

    res.status(201);
    next(buildResponse({ message: 'Account successfully created!' }));
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
