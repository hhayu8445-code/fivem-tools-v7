{
  "name": "ForumReply",
  "type": "object",
  "properties": {
    "content": {
      "type": "string"
    },
    "thread_id": {
      "type": "string"
    },
    "author_email": {
      "type": "string"
    },
    "author_name": {
      "type": "string"
    },
    "author_avatar": {
      "type": "string"
    },
    "likes_count": {
      "type": "number",
      "default": 0
    },
    "score": {
      "type": "number",
      "default": 0
    },
    "reports_count": {
      "type": "number",
      "default": 0
    }
  },
  "required": [
    "content",
    "thread_id"
  ]
}