const InvariantError = require('../../exceptions/InvariantError');
const { PlaylistSongsActivitiesPayloadSchema } = require('./schema');

const PlaylistSongsActivitiesValidator = {
  validatePlaylistSongsActivitiesPayload: (payload) => {
    const validationResult = PlaylistSongsActivitiesPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistSongsActivitiesValidator;
