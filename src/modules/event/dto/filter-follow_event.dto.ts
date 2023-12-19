export class FilterFollowEventDto {
  user_id?: string;
  event_id?: string;
  event_ids?: string[];
  page?: any;
  limit?: any;
  order_by?: any;
}
