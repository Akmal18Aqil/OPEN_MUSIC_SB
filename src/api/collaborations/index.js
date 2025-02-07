const CollaborationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (
    server,
    { collaborationService, playlistsService, usersService, validator }
  ) => {
    const collaborationsHandler = new CollaborationsHandler(
      collaborationService,
      playlistsService,
      usersService,
      validator
    );
    server.route(routes(collaborationsHandler));
  },
};