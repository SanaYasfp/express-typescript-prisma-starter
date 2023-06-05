import ErrorResponse from "../interfaces/error-response.interface";

export default function buildResponse(param: Partial<ErrorResponse> = {}): ErrorResponse {
  const { success, message = "", data = [], errors = [], metadata = {}, stack = null, } = param;

  return {
    success: success === false ? success : errors.length > 0 ? false : true,
    message,
    data,
    errors,
    metadata,
  }
}
