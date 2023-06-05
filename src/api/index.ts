import express from 'express';
import MessageResponse from '../interfaces/message-response.interface';
import buildResponse from '../utils/build-response.util';

import emojis from './emojis';
import auth from './auth';
import investment from './investment';

const router = express.Router();

router.all<{}, MessageResponse>('/', (req, res, next) => {
  next(buildResponse({ message: 'API - 👋🌎🌍🌏', }));
});

router.use(emojis);
router.use(auth);
router.use(investment);

export default router;
