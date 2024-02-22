export interface AddPointToUserData {
  user_id: string;
  point: number;

  entity_id: string;
  entity_target: string;
  entity_action: string;
}

export interface AddCoinToUserData {
  userId: string;
  coin: number;
  refObject: any;
  refType: string;
}

