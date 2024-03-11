export interface CreateReferralDTO {
  user_id: string;
  from_user_id: string;
  type: string;
  bonus_type: ReferralBonusType;
  bonus_value: number;
  ref_id: string;
  ref_type: ReferralRefType;
}

export enum ReferralType {
  SIGN_UP = "sign-up",
  BUY_PRODUCT = "buy-product",
  COMPLETE_COURSE = "complete-course",
}

export enum ReferralRefType {
  ORDER = "Order",
  PRODUCT = "Product",
  COURSE = "Course",
}

export enum ReferralBonusType {
  COIN = "coin",
}

export const COIN_TO_TOKEN = 1000;
