{
  "name": "Notification",
  "type": "object",
  "properties": {
    "user_email": {
      "type": "string",
      "description": "Recipient email"
    },
    "type": {
      "type": "string",
      "enum": [
        "reply",
        "like",
        "system"
      ]
    },
    "message": {
      "type": "string"
    },
    "link": {
      "type": "string"
    },
    "is_read": {
      "type": "boolean",
      "default": false
    }
  },
  "required": [
    "user_email",
    "message"
  ]
}