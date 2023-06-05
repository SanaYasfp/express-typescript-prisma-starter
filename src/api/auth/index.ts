import express from 'express';

import MessageResponse from '../../interfaces/message-response.interface';
import buildResponse from '../../utils/build-response.util';
import signup from './signup';
import login from './login';
import refreshAccess from './refresh-access';

const router = express.Router();

const path = '/auth';

router.route(path)
  .all<{}, MessageResponse>((req, res, next) => {
    next(buildResponse({ message: 'AUTH API - 🔐' }));
  });

router.use(path, signup);
router.use(path, login);
//router.use(path, logout);
router.use(path, refreshAccess);

export default router;
