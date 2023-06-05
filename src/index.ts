import app from './app';
import { appConfig } from './config';
import { Logger } from './utils';

const server = app.listen(appConfig.PORT, () => {
  const logger = new Logger({ });
  logger.success(`Express server listening on port: ${appConfig.PORT}`);
});
