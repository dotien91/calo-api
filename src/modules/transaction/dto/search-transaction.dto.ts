export class SearchTransactionDto {
  user_id?: string;
  user_ids?: string;
  from_user_ids?: string;
  ref_ids?: string;
  status?: string;
  status_array?: string[];
  method?: string;
  ref_id?: string;
  ref_type?: string;
  type_system?: string;
  search?: string;
  from?: string;
  to?: string;
  transaction_type?: string;
}
