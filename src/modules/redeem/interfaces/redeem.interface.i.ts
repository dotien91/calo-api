export enum RedeemMissionActionType {
  LIKE = "like",
  POST = "post",
  COMMENT = "comment",
  BUY = "buy",
  COMPLETE = "complete",
  JOIN = "join",
  REFERRAL = "referral",
  WATCH = "watch",
  SHARE = "share",
  VIEW = "view",
}

export enum RedeemMissionActionTarget {
  COMMUNITY = "community",
  COURSE = "course",
  FREE_COURSE = "freecourse",
  TEST = "test",
  ACCOUNT = "account",
  PRODUCT = "product",
  CLASS = "class",
  ONE_ONE = "oneone",
  INSTAGRAM = "instagram",
  TELEGRAM = "telegram",
  TIKTOK = "tiktok",
  TWITTER = "twitter",
  FACEBOOK = "facebook",
  YOUTUBE = "youtube",
}

export interface ShareLinkObject {
  redeem_mission_id: string;
  social_link: string;
  view_counter?: number;
  like_counter?: number;
  comment_counter?: number;
  share_counter?: number;
  status: RedeemUserSocialLinkStatus;
}

export enum RedeemUserSocialLinkStatus {
  PENDING = "pending",
  ACTIVE = "active",
  DONE = "done",
  REJECT = "reject",
}
