import express from 'express';
import MessageResponse from '../interfaces/message-response.interface';
import buildResponse from '../utils/build-response.util';

const router = express.Router();

type EmojiResponse = string[];

router.all<{}, MessageResponse>('/emojis', (req, res, next) => {
  next(buildResponse({ message: '😀 😳 🙄' }));
});

export default router;
