export enum UserRoles {
  TEACHER = "teacher",
  ADMIN = "admin",
  USER = "user",
}

export enum UserLevel {
  RANK_1 = 0,
  RANK_2 = 15,
  RANK_3 = 75,
  RANK_4 = 250,
  RANK_5 = 500,
  RANK_6 = 1500,
  RANK_7 = 5000,
  RANK_8 = 15000,
  RANK_9 = 50000,
  RANK_10 = 100000,
}

export enum UserPointHistory_EntityTarget {
  COMMUNITY = "community",
  COURSE = "course",
  TEST = "test",
  ORDER = "order",
  ACCOUNT = "account",
  PRODUCT = "product",
  CLASS = "class",
  ONE = "oneone",
}

export enum UserPointHistory_EntityAction {
  LIKE = "like",
  POST = "post",
  COMMENT = "comment",
  BUY = "buy",
  JOIN = "join",
  REFERRAL = "referral",
  WATCH = "watch",
  COMPLETE = "complete",
  SHARE = "share",
}

export enum UserSortBy {
  POINT = "point",
}
