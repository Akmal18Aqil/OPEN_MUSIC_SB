class PlaylistSongsHandler {
    constructor(playlistSongsService, validator, playlistService, songsService) {
      this._playlistSongsService = playlistSongsService;
      this._validator = validator;
      this._playlistService = playlistService;
      this._songService = songsService;
  
      this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
      this.getPlaylistsSongsHandler = this.getPlaylistsSongsHandler.bind(this);
      this.deletePlaylistSongByIdHandler =
        this.deletePlaylistSongByIdHandler.bind(this);
    }
  
    async postPlaylistSongHandler(request, h) {
      this._validator.validatePlaylistsSongPayload(request.payload);
  
      const { songId } = request.payload;
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;
  
      await this._playlistService.verifyPlaylistAccess(id, credentialId);
      await this._songService.getSongById(songId);
      await this._playlistSongsService.addSongPlaylist({
        playlistId: id,
        songId,
      });
  
      const time = new Date().toISOString();
      await this._playlistSongsService.addActivity({
        playlistId : id,
        songId,
        credentialId,
        action: 'add',
        time,
      });
  
      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan ke playlist',
      });
      response.code(201);
      return response;
    }
  
    async getPlaylistsSongsHandler(request, h) {
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;
  
      await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
  
      const playlist = await this._playlistSongsService.getSongPlaylist(
        playlistId
      );
      const response = h.response({
        status: 'success',
        data: {
          playlist,
        },
      });
      response.code(200);
      return response;
    }
  
    async deletePlaylistSongByIdHandler(request, h) {
      this._validator.validatePlaylistsSongPayload(request.payload);
  
      const { id: playlistId } = request.params;
      const { songId } = request.payload;
      const { id: credentialId } = request.auth.credentials;
  
      await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
  
      await this._playlistSongsService.deleteSongPlaylist(playlistId, songId, credentialId);
  
      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil dihapus dari playlist',
      });
      response.code(200);
      return response;
    }
  }
  
  module.exports = PlaylistSongsHandler;