{
  "name": "Asset",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Judul Aset"
    },
    "description": {
      "type": "string",
      "description": "Deskripsi lengkap"
    },
    "category": {
      "type": "string",
      "enum": [
        "script",
        "mlo",
        "vehicle",
        "clothing",
        "tool"
      ],
      "description": "Kategori utama"
    },
    "framework": {
      "type": "string",
      "enum": [
        "esx",
        "qbcore",
        "standalone",
        "vmenu",
        "other"
      ],
      "default": "standalone"
    },
    "type": {
      "type": "string",
      "enum": [
        "paid",
        "free",
        "leaked",
        "open_source"
      ],
      "default": "free"
    },
    "thumbnail": {
      "type": "string",
      "description": "URL Gambar Utama (Card)"
    },
    "images": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Gallery images"
    },
    "download_url": {
      "type": "string"
    },
    "version": {
      "type": "string"
    },
    "file_size": {
      "type": "string"
    },
    "author": {
      "type": "string"
    },
    "uploaded_by": {
      "type": "string",
      "description": "Email user yang upload"
    },
    "uploader_name": {
      "type": "string",
      "description": "Nama user yang upload"
    },
    "is_premium": {
      "type": "boolean",
      "default": false
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "views": {
      "type": "number",
      "default": 0
    },
    "downloads": {
      "type": "number",
      "default": 0
    }
  },
  "required": [
    "title",
    "category",
    "download_url"
  ]
}