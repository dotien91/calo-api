export class FilterUserLocationDto {
  user_id?: string
  distance?: number
  latitude?: number
  longitude?: number
  from?: string
  to?: string;
  date?: string
  page?: number
  limit?: number
  order_by?: string
}
