import * as dotenv from 'dotenv';
import { appConfig, dotenvConfig } from './';

dotenv.config(dotenvConfig);


export const defaultOptions = {
  from: { name: appConfig.APP_NAME + " Team", email: appConfig.CONTACT.email },
  templateId: "d-83839b67e6d340da92ae57b79beee9bd",
};
export const serviceID = String(process.env.SERVICE_ID);
export const accountSID = String(process.env.ACCOUNT_SID);
export const authToken = String(process.env.AUTH_TOKEN);
export const sendGridApiKey = String(process.env.SG_APIKEY);
export const templateIDs = {
  accountActivation: "d-2bf39b1d1e524c299d519bff79de5cb5",
  invitation: "d-b882140a9bbe4e2b84f64ffbbbf93679",
  acceptTransaction: "d-0889c2f6d1d34b0cb88f56057d73c7e6",
  rejectTransaction: "d-65e331c309284891a25b31f3d11d4628",
};
