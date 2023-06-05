import sgMail from '@sendgrid/mail';
import { twilioConfig } from '../config';
import SGMailData from '../interfaces/twilio.interface';

sgMail.setApiKey(twilioConfig.sendGridApiKey);

export async function sendEmail (...options: SGMailData[]){
  try {
    const data = options.map((option) => {
      return {
        ...twilioConfig.defaultOptions,
        ...option,
        from: {
          ...twilioConfig.defaultOptions.from,
          ...option.from
        }
      }
    });
    return await sgMail.send(data);
  } catch (error) {
    throw error;
  }
}

