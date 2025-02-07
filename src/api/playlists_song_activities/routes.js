const routes = (handler) => [
  {
    method: 'GET',
    path: '/playlists/{id}/activities',
    handler: handler.getPlaylistSongsActivitiesHandler,
    options: {
      auth: 'songsapp_jwt',
    },
  },
];

module.exports = routes;