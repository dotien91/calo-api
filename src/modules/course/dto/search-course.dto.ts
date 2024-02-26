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
  onlyEnglishNativeSpeakers?: boolean;
}

export class SearchSaleCourseDto {
  coupon_id?: string;
  is_sale?: boolean;
  user_id?: string;
}

export class SearchTutorDto {
  skills?: string[];
  types?: string[];
  onlyEnglishNativeSpeakers?: boolean;
  timeAvailable?: Array<{
    time_start: string;
    time_end: string;
  }>;
  levelOfTutor?: string[];
  display_name?: string;
}
