const Hapi = require('@hapi/hapi');
const albums = require('./api/albums');
const AlbumService = require('./service/postgres/AlbumService');
const AlbumsValidator = require('./validator/albums');
const songs = require('./api/songs');
const SongService = require('./service/postgres/SongService');
const SongsValidator = require('./validator/songs');
const ClientError = require('./exceptions/ClientError');

require('dotenv').config();

const init = async () => {
  const albumsService = new AlbumService();
  const songsService = new SongService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });
  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
  ]);
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    return h.continue;
  });
  await server.start();
  console.log(`server berjalan pada ${server.info.uri}`);
};

init();
