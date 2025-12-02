{
  "name": "ForumLike",
  "type": "object",
  "properties": {
    "user_email": {
      "type": "string"
    },
    "target_id": {
      "type": "string"
    },
    "target_type": {
      "type": "string",
      "enum": [
        "thread",
        "reply"
      ]
    },
    "value": {
      "type": "number",
      "default": 1,
      "description": "1 for upvote, -1 for downvote"
    }
  },
  "required": [
    "user_email",
    "target_id",
    "target_type"
  ]
}