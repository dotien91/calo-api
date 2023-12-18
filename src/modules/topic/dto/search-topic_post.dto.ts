export class SearchTopicPostDto {
  user_id?: string
  post_type?: string
  search?: string
  post_status?: string
  post_language?: string
  chat_room_id?: string
  topic_id?: string
  is_homepage?: number
  is_trending?: number
  topic_ids?: string[]
}
