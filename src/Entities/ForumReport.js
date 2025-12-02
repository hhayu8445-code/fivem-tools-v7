{
  "name": "ForumReport",
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
    "reason": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "resolved",
        "dismissed"
      ],
      "default": "pending"
    },
    "resolution_notes": {
      "type": "string"
    }
  },
  "required": [
    "user_email",
    "target_id",
    "reason"
  ]
}