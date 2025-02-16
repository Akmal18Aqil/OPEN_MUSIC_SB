const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const path = require('path');
const Inert = require('@hapi/inert');

// Kelompok Album
const albums = require('./api/albums');
const AlbumService = require('./service/postgres/AlbumService');
const AlbumsValidator = require('./validator/albums');
// Kelompok Song
const songs = require('./api/songs');
const SongService = require('./service/postgres/SongService');
const SongsValidator = require('./validator/songs');
// kelompok User
const users = require('./api/users');
const UsersService = require('./service/postgres/UsersService');
const UsersValidator = require('./validator/users');
// Kelompok Authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./service/postgres/AuthenticationService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');
// Kelompok playlists
const playlists = require('./api/playlists');
const PlaylistsService = require('./service/postgres/PlaylistService');
const PlaylistsValidator = require('./validator/playlists');
// Kelompok collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./service/postgres/CollaborationService');
const CollaborationsValidator = require('./validator/collaborations');
// kelompok playlists_songs
const playlistSong = require('./api/playlists_song');
const PlaylistSongsService = require('./service/postgres/PlaylistSongService');
const PlaylistsSongValidator = require('./validator/playlist_songs');
// Kelompok playlist_activities
const playlistSongsActivities = require('./api/playlists_song_activities');
const PlaylistSongsActivitiesService = require('./service/postgres/PlaylistSongActivitiesService');
const PlaylistSongsActivitiesValidator = require('./validator/playlist_song_activities');
// Kelompok exports
const _exports = require('./api/exports');
const ProducerService = require('./service/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');
// Kelompok Uploads
const uploads = require('./api/uploads');
const StorageService = require('./service/storage/StorageService');
const UploadsValidator = require('./validator/upload');
// cache
const CacheService = require('./service/redis/CacheService');

// Ekseptions
const ClientError = require('./exceptions/ClientError');

require('dotenv').config();

const init = async () => {
  const cacheService = new CacheService();
  const albumsService = new AlbumService(cacheService);
  const songsService = new SongService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationService);
  const playlistSongsService = new PlaylistSongsService();
  const playlistSongsActivitiesService = new PlaylistSongsActivitiesService();
  const storageService = new StorageService(
    path.resolve(__dirname, 'api/uploads/file/pictures')
  );
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    debug: {
      request: ['error'],
    },
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    }


  ]);
  // ini mendefinisikan strategy autentikasi jwt
  server.auth.strategy('songsapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
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
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationService,
        playlistsService,
        usersService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: playlistSong,
      options: {
        playlistsService,
        songsService,
        playlistSongsService,
        collaborationService,
        validator: PlaylistsSongValidator,
      },
    },
    {
      plugin: playlistSongsActivities,
      options: {
        playlistsService,
        playlistSongsActivitiesService,
        validator: PlaylistSongsActivitiesValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        ProducerService,
        playlistsService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        albumsService,
        validator: UploadsValidator,
      },
    },

  ]);
  await server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      console.log(response);
      return h
        .response({
          status: 'fail',
          message: response.message,
        })
        .code(response.statusCode);
    }

    if (response instanceof Error) {
      const { statusCode, payload } = response.output;

      switch (statusCode) {
      case 401:
        return h.response(payload).code(401);
      case 404:
        return h.response(payload).code(404);
      case 413: 
        return h
          .response({
            status: 'fail',
            message: 'Ukuran file terlalu besar, maksimal 512 KB',
          })
          .code(413);
      default:
        console.log(response);
        return h
          .response({
            status: 'error',
            error: payload.error,
            message: payload.message,
          })
          .code(500);
      }
    }

    return response.continue || response;
  });
  await server.start();
  console.log(`server berjalan pada ${server.info.uri}`);
};

init();
