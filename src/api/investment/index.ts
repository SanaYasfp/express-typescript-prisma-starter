import express from 'express';

import MessageResponse from '../../interfaces/message-response.interface';
import { authentication, authorization } from '../../middlewares/auth.middleware';
import buildResponse from '../../utils/build-response.util';
import invest from './invest';

const router = express.Router();

router.use(authentication);

const path = '/investment';

router.route(path)
  .all<{}, MessageResponse>((req, res, next) => {
    next(buildResponse({ message: 'INVESTMENT API - 🏦' }));
  });

router.use(path, authorization('LENDER'), invest); // lender
//router.use(path, modification/reduce); // lender
//router.use(path, modification/abort); // lender
//router.use(path, check-up); // admin

export default router;
