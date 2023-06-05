import { appConfig } from "../config";
import { Request } from "express";

export interface CustomRequest extends Request {
  auth?: {
    id: number;
    phone_number: string;
    email: string;
    full_name: string;
    role: string;
    created_at: string;
  }
}
