import { Users } from "@prisma/client";
import { randomUUID } from "crypto";
import { Request } from 'express';
import jwt from "jsonwebtoken";
import { appConfig } from "../config";
import { HasherHelper } from "./hasher.util";

export const getAccess = async (user: Users) => {

  const position = Math.random() > 0.5 ? 0 : 1;
  //const secret = position > 0
  //  ? `${appConfig.JWT_SECRET}${refreshToken}`
  //  : `${refreshToken}${appConfig.JWT_SECRET}`;
  const { id, phone_number, email, full_name, role, created_at, password } = user;
  const accessToken = jwt.sign(
    {
      position,
      user: { id, phone_number, email, full_name, role, created_at },
    },
    //secret,
    appConfig.JWT_SECRET,
    { expiresIn: appConfig.TOKEN_TTL }
  );
  /**
   * pos > 0: jwt_secret + access_token + password + email
   * pos < 1: access_token + jwt_secret + password + email
   * 
   * format in base64Url
   */
  const secret = position > 0
    ? `${appConfig.JWT_SECRET}${accessToken}${password}${email}${role}`
    : `${accessToken}${appConfig.JWT_SECRET}${password}${email}${role}`;
  const refreshToken = (await HasherHelper.hmac(accessToken, secret, { encodings: ['base64url'] })).base64url as string;

  return { accessToken, refreshToken };
};
