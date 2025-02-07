const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

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

// Ekseptions
const ClientError = require('./exceptions/ClientError');

require('dotenv').config();

const init = async () => {
  const albumsService = new AlbumService();
  const songsService = new SongService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistsService = new PlaylistsService();
  const collaborationService = new CollaborationsService();
  const playlistSongsService = new PlaylistSongsService();
  const playlistSongsActivitiesService = new PlaylistSongsActivitiesService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    debug: {
      request:['error'] ,
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
    // {
    //   plugin: Inert,
    // },
  ]);
  // mendefinisikan strategy autentikasi jwt
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
