import { TransactionRefType } from "../../../modules/transaction/interfaces/transaction.interface";

export enum OrderPaymentMethod {
  VNPAY = "vn_pay",
  TRANSFER = "transfer",
}

export enum OrderStatus {
  PENDING = "pending",
  SUCCESS = "success",
  CLOSE = "close",
  PROCESSING = "processing",
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

export interface OrderItem {
  service_name: string;
  service_id: any;
  plan_id: any;
  plan_type: string;
  payload: object;
  type: TransactionRefType;
}
