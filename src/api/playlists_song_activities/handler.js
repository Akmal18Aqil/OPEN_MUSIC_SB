class PlaylistSongsActivitiesHandler {
  constructor(service, playlistService, validator) {
    this._service = service;
    this._playlistService = playlistService;
    this._validator = validator;

    this.getPlaylistSongsActivitiesHandler = this.getPlaylistSongsActivitiesHandler.bind(this);
  }

  async getPlaylistSongsActivitiesHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);

    const data = {};
    const playlist = await this._playlistService.getPlaylistById(credentialId, playlistId);
    data.playlistId = playlist.id;
    data.activities = await this._playlistService.getPlaylistActivities(playlistId);

    const response = h.response({
      status: 'success',
      data,
    });
    response.code(200);
    return response;
  }
}

module.exports = PlaylistSongsActivitiesHandler;
