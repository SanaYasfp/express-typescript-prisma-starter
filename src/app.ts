import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import path from 'path';
import api from './api';
import { appConfig } from './config';
import MessageResponse from './interfaces/message-response.interface';
import * as middlewares from './middlewares';
import { Logger } from './utils';
import buildResponse from './utils/build-response.util';

require('dotenv').config();

const app = express();

// public ressources setup
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


//setup routes
app.all<{}, MessageResponse>('/', (req, res, next) => {
  next(buildResponse({ message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄' }));
});
app.use(appConfig.BASE_ROUTE, api);


app.use(middlewares.sendResponse);

//setup error handlers
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
