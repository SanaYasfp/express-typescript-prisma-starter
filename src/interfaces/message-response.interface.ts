import FieldError from "./field-error.interface";

export default interface MessageResponse {
  success: boolean,
  message: string;
  data: any[],
  errors: FieldError[],
  metadata?: Record<string | number, any>,
}

