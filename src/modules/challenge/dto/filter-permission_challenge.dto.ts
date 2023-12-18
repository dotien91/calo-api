export class FilterPermissionChallengeDto {
  user_id?: string
  challenge_id?: string
  challenge_ids?: string[]
  user_ids?: string[]
  unset?: string[]
  official_status?: string
  game_type?: string
  channel_id?: string
  max_point?: string | number
}
