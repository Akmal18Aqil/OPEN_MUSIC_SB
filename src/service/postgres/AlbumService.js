const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapAlbumDBToModel, mapSongDBToModel } = require('../../utils');

class AlbumService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO albums (id, name, year, created_at) VALUES ($1, $2, $3, $4) RETURNING id',
      values: [id, name, year, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this._pool.query('SELECT id, name, year FROM albums');
    return result.rows.map(mapAlbumDBToModel);
  }

  async getAlbumById(id) {
    const albumQuery = {
      text: 'SELECT id, name, year, "coverUrl" FROM albums WHERE id = $1',
      values: [id],
    };
    const albumResult = await this._pool.query(albumQuery);

    if (!albumResult.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const album = albumResult.rows.map(mapAlbumDBToModel)[0];

    const songsQuery = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [album.id],
    };
    const songsResult = await this._pool.query(songsQuery);

    const songs = songsResult.rows.map(mapSongDBToModel);

    return {
      id: album.id,
      name: album.name,
      year: album.year,
      coverUrl: album.coverUrl || null, // Memastikan coverUrl selalu ada
      songs,
    };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }
  async updateCoverAlbumById(albumId, coverUrl) {
    // memastikan album ada sebelum mengupdate cover
    await this.getAlbumById(albumId);
    
    const query = {
      text: 'UPDATE albums SET "coverUrl" = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, albumId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError(
        'Cover Album gagal diperbarui. Id tidak ditemukan'
      );
    }
  }
  // async validateLikeAlbum(userId, albumId) {
  //   const query = {
  //     text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
  //     values: [userId, albumId],
  //   };
  //   const result = await this._pool.query(query);
  //   if (!result.rows.length) {
  //     return false;
  //   }
  //   return true;
  // }

  // async addAlbumLikes(userId, albumId) {
  //   const id = nanoid(16);

  //   const query = {
  //     text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
  //     values: [id, userId, albumId],
  //   };

  //   const result = await this._pool.query(query);

  //   if (!result.rows[0].id) {
  //     throw new InvariantError('Album Like gagal ditambahkan');
  //   }
  //   await this._cacheService.delete(`likes:${albumId}`);
  //   return result.rows[0].id;
  // }

  // async getAlbumLikes(id) {
  //   try {
  //     const customHeader = 'cache';
  //     const likes = await this._cacheService.get(`likes:${id}`);
  //     return { customHeader, likes: +likes };
  //   } catch {
  //     await this.getAlbumById(id);

  //     const customHeader = 'server';
  //     const query = {
  //       text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
  //       values: [id],
  //     };

  //     const result = await this._pool.query(query);
  //     const likes = result.rowCount;
  //     await this._cacheService.set(`likes:${id}`, likes);
  //     return { customHeader, likes };
  //   }
  // }

  // async deleteAlbumLike(id, userId) {
  //   await this.getAlbumById(id);
  //   const query = {
  //     text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
  //     values: [userId, id],
  //   };
  //   const result = await this._pool.query(query);
  //   if (!result.rows.length) {
  //     throw new NotFoundError('Id tidak ditemukan');
  //   }
  //   await this._cacheService.delete(`likes:${id}`);
  // }

}

module.exports = AlbumService;
