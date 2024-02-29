export interface SendSocketPayload {
  eventName: string;
  email: string;
  replacePattern: object;
  language: string;
}

export enum SocketPath {
  END_CALL = "end-call",
  MAKE_CALL = "make-call",
  UPDATE_CALL = "update-call",
  REPLY_ROOM = "reply-room",
  SEND_MESSAGE = "send-message",
  UPDATE_POINT = "update-point",
  UPDATE_REDEEM = "update-redeem",
  LIVESTREAM_VIEW = "livestream-view",
  LIVESTREAM_COMMENT = "livestream-comment",
  LIVESTREAM_EMOJI = "livestream-emoji",
  EMIT_OFFER = "emit-offer",
  LIVESTREAM_END = "livestream-end",
  LEAVE_ROOM_LIVESTREAM = "leave-room-livestream",
  LIVESTREAM_START = "livestream-start",
  LIVESTREAM_PRODUCT = "livestream-product",
  NOTIFICATION = "notification",
  UPDATE_COIN = "update-coin",
  CHANGE_LOCATION = "change-location",
}
