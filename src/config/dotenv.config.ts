import { join } from "path";
import * as dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV;

export const dotenvConfig = {
  debug: Boolean(process.env.DEBUG),
  path: `${nodeEnv ? '.' + nodeEnv : ''}.env`
};
