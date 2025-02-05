const Hapi = require('@hapi/hapi');
// Kelompok Album
const albums = require('./api/albums');
const AlbumService = require('./service/postgres/AlbumService');
const AlbumsValidator = require('./validator/albums');
//Kelompok Song
const songs = require('./api/songs');
const SongService = require('./service/postgres/SongService');
const SongsValidator = require('./validator/songs');
//kelompok User
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');
// Kelompok Authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');
// Ekseptions
const ClientError = require('./exceptions/ClientError');

require('dotenv').config();

const init = async () => {
  const albumsService = new AlbumService();
  const songsService = new SongService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
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
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    // {
    //   plugin: playlists,
    //   options: {
    //     service: playlistsService,
    //     validator: PlaylistsValidator,
    //   },
    // },
    // {
    //   plugin: collaborations,
    //   options: {
    //     collaborationsService,
    //     playlistsService,
    //     usersService,
    //     validator: CollaborationsValidator,
    //   },
    // },
    // {
    //   plugin: playlistSong,
    //   options: {
    //     playlistsService,
    //     songsService,
    //     playlistSongsService,
    //     collaborationsService,
    //     validator: PlaylistsSongValidator,
    //   },
    // },
    // {
    //   plugin: playlistSongsActivities,
    //   options: {
    //     playlistsService,
    //     playlistSongsActivitiesService,
    //     validator: PlaylistSongsActivitiesValidator,
    //   },
    // },
    // {
    //   plugin: _exports,
    //   options: {
    //     ProducerService,
    //     playlistsService,
    //     validator: ExportsValidator,
    //   },
    // },
    // {
    //   plugin: uploads,
    //   options: {
    //     service: storageService,
    //     albumsService,
    //     validator: UploadsValidator,
    //   },
    // },
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
