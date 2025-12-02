{
  "name": "DownloadLog",
  "type": "object",
  "properties": {
    "user_email": {
      "type": "string"
    },
    "asset_id": {
      "type": "string"
    },
    "download_date": {
      "type": "string",
      "format": "date-time"
    }
  },
  "required": [
    "user_email",
    "asset_id"
  ]
}