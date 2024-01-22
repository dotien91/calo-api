export class SearchCourseDto {
  user_id?: string;
  search?: string;
  course_status?: string;
  language?: string;
  country?: string;
  ids?: string;
  ref_id?: string;
  min_price?: string;
  max_price?: string;
  levels?: string[];
  skills?: string[];
  types?: string[];
}
