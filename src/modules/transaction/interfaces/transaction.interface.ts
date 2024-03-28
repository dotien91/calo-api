export enum TransactionRefType {
  COURSE = "Course",
  PRODUCT = "Product",
  ORDER = "Order", // private, not show this to frontend
  REDEEM_MISSION = "RedeemMission",
  REFERRAL = "Referral",
}

export enum TransactionValueType {
  COIN = "coin",
  TOKEN = "token",
}

export enum TransactionStatus {
  PROCESSING = "processing",
  DONE = "done",
  REJECT = "reject",
}
