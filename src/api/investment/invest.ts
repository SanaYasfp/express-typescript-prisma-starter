import { PrismaClient } from "@prisma/client";
import express from "express";
import * as fs from 'fs';
import * as Joi from 'joi';
import path from "path";
import { appConfig } from "../../config";
import { CustomRequest } from "../../interfaces/custom-request.interface";
import FieldError from "../../interfaces/field-error.interface";
import { calculGain, dtoValidator, handlePrismaError, jwtErrorHandler, Logger } from "../../utils";
import buildResponse from "../../utils/build-response.util";

const router = express.Router();
const logger = new Logger();
const constants = appConfig.constants;

router.post('/invest', async (req: CustomRequest, res, next) => {
  const schema = Joi.object({
    amount: Joi.number().positive().min(200).required(),
    term: Joi.number().integer().positive().min(3).max(36).required(),
    proof: Joi.string().trim().dataUri().required(),
  });

  try {
    const { errors, result } = await dtoValidator<{
      amount: number;
      term: number;
      proof: string;
    }>(schema, req.body);

    if (errors || !result) {
      res.status(400);
      next(buildResponse({ success: false, message: 'Complete all fields correctly.', errors: errors as FieldError[] }));
      return;
    }

    const { amount, term, proof } = result;

    //const dataUri = 'data:image/png;base64,iVBORw0KGg...';

    const matches = proof.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (!matches) {
      res.status(400);
      next(buildResponse({ success: false, message: 'Bad proof file formating' }));
      return;
    }

    const [, mime, encodedFile] = matches;
    const [, ext] = mime.split('/');
    const buffer = Buffer.from(encodedFile, 'base64');
    const filename = `proof-${req.auth?.id}.${ext}`;

    try {
      const destinationFilePath = path.join(__dirname, '..', '..', '..', 'public', 'proofs', filename);
      fs.writeFileSync(destinationFilePath, buffer, { encoding: 'base64' });
    } catch (err) {
      logger.error(err);
      throw new Error('An error occur while saving proof document');
    }

    logger.debug(`${req.baseUrl}/public/proofs/${filename}`);
    const prismaClient = new PrismaClient();
    const gain = calculGain(term, amount);

    await prismaClient.investments.create({
      data: {
        amount,
        term,
        proof: `/public/proofs/${filename}`,
        gain,
        status: appConfig.INVESTMENT.STATUS.PENDING,
        lender: req.auth!.id
      }
    })

    res.status(201);
    next(buildResponse({
      message: 'hello!',
      //data: [{ token_type: "Bearer", access_token: accessToken, refresh_token: refreshToken }],
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
