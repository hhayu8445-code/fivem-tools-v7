{
  "name": "UserProfile",
  "type": "object",
  "properties": {
    "user_email": {
      "type": "string"
    },
    "membership_tier": {
      "type": "string",
      "enum": [
        "guest",
        "free",
        "vip",
        "admin",
        "moderator"
      ],
      "default": "free"
    },
    "discord_id": {
      "type": "string"
    },
    "daily_downloads_count": {
      "type": "number",
      "default": 0
    },
    "last_download_date": {
      "type": "string",
      "format": "date"
    },
    "points": {
      "type": "number",
      "default": 0
    },
    "reputation": {
      "type": "number",
      "default": 0
    },
    "forum_signature": {
      "type": "string"
    },
    "posts_count": {
      "type": "number",
      "default": 0
    },
    "likes_received_count": {
      "type": "number",
      "default": 0
    },
    "is_banned": {
      "type": "boolean",
      "default": false
    },
    "ban_reason": {
      "type": "string",
      "description": "Reason for ban"
    },
    "banned_at": {
      "type": "string",
      "format": "date-time",
      "description": "When user was banned"
    },
    "banned_by": {
      "type": "string",
      "description": "Admin who banned the user"
    },
    "total_downloads": {
      "type": "number",
      "default": 0
    },
    "username": {
      "type": "string",
      "description": "Discord username"
    },
    "last_seen": {
      "type": "string",
      "format": "date-time"
    }
  },
  "required": [
    "user_email"
  ]
}