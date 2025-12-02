export const VouchMessage = {
  name: 'VouchMessage',
  fields: {
    discord_user_id: { type: 'string', required: true },
    discord_username: { type: 'string', required: true },
    channel_id: { type: 'string', required: true },
    message_id: { type: 'string', required: true },
    message_link: { type: 'string', required: true },
    vouch_text: { type: 'string', required: true },
    verified: { type: 'boolean', default: false },
    created_date: { type: 'date', default: () => new Date().toISOString() }
  }
};
