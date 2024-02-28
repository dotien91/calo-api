export enum OrderPaymentMethod {
  VNPAY = "vn_pay",
  TRANSFER = "transfer",
}

export enum OrderStatus {
  PENDING = "pending",
  SUCCESS = "success",
  // [
  //   "pending",
  //   "processing",
  //   "fraud",
  //   "success",
  //   "close",
  //   "draft",
  //   "trial",
  //   "error",
  //   "trial_false",
  //   "done",
  //   "free",
  // ]
}

export enum PayloadType {
  CLASS = "class",
  ONE_ONE = "oneone",
}

export enum OrderItemType {
  COURSE = "course",
  PRODUCT = "product",
}

export interface OrderItem {
  service_name: string;
  service_id: any;
  plan_id: any;
  plan_type: string;
  payload: object;
  type: OrderItemType;
}
