import jwt from "jsonwebtoken";
import { appConfig, twilioConfig } from "../config";
import { Logger, sendEmail } from "./";

export const sendMagicLink = async (userId: number, to: string) => {
  const token = jwt.sign({ user_id: userId }, appConfig.JWT_SECRET, { expiresIn: appConfig.MAGIC_LINK_TTL });
  const tokenBase64Url = Buffer.from(token, 'utf-8').toString("base64url");
  const magicLink = `${appConfig.APP_BASE_URL}?magicLink=${tokenBase64Url}`;


  await sendEmail({
    from: {
      email: appConfig.CONTACT.email,
      name: `${appConfig.APP_NAME} Account Team`
    },
    to,
    templateId: twilioConfig.templateIDs.accountActivation,
    dynamicTemplateData: {
      magicLink,
      appName: appConfig.APP_NAME,
      teamContact: appConfig.CONTACT.email
    }
  });
};
