{
  "name": "ForumThread",
    "type": "object",
      "properties": {
    "title": {
      "type": "string"
    },
    "content": {
      "type": "string"
    },
    "category_id": {
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
    "views": {
      "type": "number",
        "default": 0
    },
    "replies_count": {
      "type": "number",
        "default": 0
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
    "is_pinned": {
      "type": "boolean",
        "default": false
    },
    "is_locked": {
      "type": "boolean",
        "default": false
    },
    "last_reply_date": {
      "type": "string",
        "format": "date-time"
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
    "title",
    "content",
    "category_id"
  ]
}