export interface SendEmailPayload {
  eventName: string;
  email: string;
  replacePattern: object;
  language: string;
}

export enum EmailPattern {
  VERIFY_CODE = "verify-code",
  LIVESTREAM_NOW = "livestream-now",
  LIVESTREAM_CREATE = "livestream-create",
  REGISTER = "register",
  CLOSE_ORDER = "close-order",
  SUCCESS_ORDER = "success-order",
  PENDING_ORDER = "pending-order",
  INVOICE_ORDER = "invoice-order",
}

