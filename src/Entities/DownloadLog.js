{
  "name": "DownloadLog",
  "type": "object",
  "properties": {
    "user_email": {
      "type": "string",
      "description": "User email"
    },
    "user_id": {
      "type": "string",
      "description": "Discord user ID"
    },
    "username": {
      "type": "string",
      "description": "Discord username"
    },
    "asset_id": {
      "type": "string",
      "description": "Asset ID downloaded"
    },
    "asset_title": {
      "type": "string",
      "description": "Asset title"
    },
    "asset_category": {
      "type": "string",
      "description": "Asset category (script, mlo, vehicle, etc)"
    },
    "download_date": {
      "type": "string",
      "format": "date-time",
      "description": "When downloaded"
    },
    "user_profile_tier": {
      "type": "string",
      "enum": ["free", "vip", "admin", "moderator"],
      "description": "User membership tier at time of download"
    },
    "ip_info": {
      "type": "string",
      "description": "Browser/IP information for tracking"
    }
  },
  "required": [
    "user_email",
    "asset_id",
    "download_date"
  ]
}