{
  "name": "Achievement",
  "type": "object",
  "properties": {
    "user_email": {
      "type": "string"
    },
    "achievement_type": {
      "type": "string",
      "enum": ["first_download", "first_post", "helpful_member", "vip_member", "veteran", "bug_hunter", "top_contributor"]
    },
    "earned_date": {
      "type": "string",
      "format": "date-time"
    },
    "points_awarded": {
      "type": "number",
      "default": 0
    }
  },
  "required": ["user_email", "achievement_type"]
}
