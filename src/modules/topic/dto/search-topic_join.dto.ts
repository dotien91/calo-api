export class SearchTopicJoinDto {
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
  is_official?: number
  is_validate?: number
  is_parent?: number
  is_child?: number
  parent_id?: string
  status?: string
}
