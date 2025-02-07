const Joi = require('joi');

const PlaylistSongsActivitiesPayloadSchema = Joi.object({
  PlaylistId: Joi.string().required(),
});

module.exports = { PlaylistSongsActivitiesPayloadSchema };
