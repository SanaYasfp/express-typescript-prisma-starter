import * as dotenv from 'dotenv';
import { join } from 'path';
import { dotenvConfig } from './';


dotenv.config(dotenvConfig);
const NODE_ENV = process.env.NODE_ENV || 'development';

export const APP_NAME = process.env.APP_NAME || 'Kori Invest';
export const APP_VERSION = process.env.APP_VERSION || 'v1';
export const PORT = process.env.PORT || 3000;
export const BASE_ROUTE = `/${APP_VERSION}`;
export const APP_BASE_URL = 'https://app.kori-invest.com';
export const BASE_URL = NODE_ENV === 'development'
  ? `http://127.0.0.1:${PORT}`
  : 'https://api.kori-invest.com';
export const CONTACT = {
  //TODO: update contact (on sendgrid too)
  email: 'dev@coollionfi.com', // 'contact@kori-invest.com',
  phone: '',
};

export const JWT_SECRET = String(process.env.JWT_SECRET);

/** 2 days */
export const MAGIC_LINK_TTL = 2 * 24 * 60 * 60;

/** 6 minutes */
export const TOKEN_TTL = 6 * 60;

/** 1 hour */
export const SESSION_TTL = 60 * 60;

export const ROLES = {
  LENDER: 'lender',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  CUSTOMER_ADVISOR: 'customer advisor',
} as const;

export const INVESTMENT = {
  MIN_RATE: 3, // percent
  MAX_RATE: 6, // percent
  MIN_TERM: 3,
  MAX_TERM: 36,
  STATUS: {
    PENDING: 'pending', //0,
    CONFIRMED: 'confirmed', //1,
    CHANGE_REQUEST: 'change request', // -1,
    ABORT_REQUEST: 'early stop request', //-2,
  }
}

export const constants = {
  TOKEN_EXPIRED: "Token expired",
  INVALID_TOKEN: "Invalid token",
  AUTH_HEADER_MISSED: "Missing authorization header",
  ERR_BEARER_TOKEN: "Invalid authorization header",
  COMPROMISED_SESSION: "Session possibly compromised.",
  ERR_REVOKED_SESSION: "Session revoked, re login required!",
  EXP_SESSION: "Session expired.",
  ERR_AUTH_RULES: "Invalid authorization rules",
  ACCESS_DENIED: "Access denied",
  ANY_FIELD: "any field",
  LOGGED: "logged"
}
