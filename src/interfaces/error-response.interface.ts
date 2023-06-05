import MessageResponse from "./message-response.interface";

export default interface ErrorResponse extends MessageResponse {
  stack?: string;
}