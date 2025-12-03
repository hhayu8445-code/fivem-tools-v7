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
    },
    "created_date": {
      "type": "string",
        "format": "date-time"
    },
    "updated_date": {
      "type": "string",
        "format": "date-time"
    },
    "updated_by": {
      "type": "string"
    },
    "is_deleted": {
      "type": "boolean",
        "default": false
    },
    "deleted_reason": {
      "type": "string"
    },
    "deleted_by": {
      "type": "string"
    },
    "deleted_date": {
      "type": "string",
        "format": "date-time"
    }
  },
  "required": [
    "content",
    "thread_id"
  ]
}