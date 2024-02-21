export interface CreateReferralDTO {
  user_id: string;
  from_user_id: string;
  type: string;
}

export enum ReferralType {
  SIGN_UP = "sign-up",
  BUY_COURSE = "buy-course",
  COMPLETE_COURSE = "complete-course",
}

