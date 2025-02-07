const PlaylistSongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistSongs',
  version: '1.0.0',
  register: async (
    server,
    {
      playlistSongsService,
      validator,
      playlistsService,
      songsService,
      collaborationsService,
    }
  ) => {
    const playlistSongsHandler = new PlaylistSongsHandler(
      playlistSongsService,
      validator,
      playlistsService,
      songsService,
      collaborationsService
    );
    server.route(routes(playlistSongsHandler));
  },
};