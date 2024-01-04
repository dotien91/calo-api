export interface SendEmailPayload {
  eventName: string;
  email: string;
  replacePattern: object;
}

export enum EmailPattern {
  VERIFY_CODE = "verify-code",
  LIVESTREAM_NOW = "livestream-now",
  LIVESTREAM_CREATE = "livestream-create",
}

