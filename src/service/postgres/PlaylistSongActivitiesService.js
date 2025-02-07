const { Pool } = require('pg');

class PlaylistSongsActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async getPlaylistActivites(playlistId) {
    const query = {
      text: `SELECT 
      users.username, 
      songs.title, 
      playlist_songs_activities.action, 
      playlist_songs_activities.time
    FROM playlist_songs_activities 
    JOIN users ON playlist_songs_activities.user_id = users.id
    JOIN songs ON playlist_songs_activities.song_id = songs.id
    WHERE playlist_songs_activities.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}
module.exports = PlaylistSongsActivitiesService;
