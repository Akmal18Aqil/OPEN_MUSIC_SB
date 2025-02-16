class UploadsHandler {
  constructor(service, albumsService, validator) {
    this._service = service;
    this._albumsService = albumsService;
    this._validator = validator;

    this.postUploadCoverImageHandler = this.postUploadCoverImageHandler.bind(this);
  }

  async postUploadCoverImageHandler(request, h) {
    try {
      const { id: albumId } = request.params;
      const { cover } = request.payload;

      if (!cover) {
        return h.response({
          status: 'fail',
          message: 'Gambar harus diupload',
        }).code(400);
      }
      // Validasi Tipe File
      try {
        this._validator.validateImageHeaders(cover.hapi.headers);
      } catch (error) {
        return h.response({
          status: 'fail',
          message: 'Format file tidak didukung, hanya jpg/jpeg/png yang diperbolehkan',
        }).code(400);
      }

      this._validator.validateImageHeaders(cover.hapi.headers);

      const filename = await this._service.writeFile(cover, cover.hapi);
      const baseUrl = `http://${process.env.HOST}:${process.env.PORT}`;
      const coverUrl = `${baseUrl}/uploads/pictures/${filename}`;

      await this._albumsService.updateCoverAlbumById(albumId, coverUrl);

      return h.response({
        status: 'success',
        message: 'Sampul berhasil diunggah',
        data: { coverUrl },
      }).code(201);
    } catch (error) {
      console.error(error);
      return h.response({
        status: 'error',
        message: error.message || 'Terjadi kesalahan pada server',
      }).code(500);
    }
  }
}

module.exports = UploadsHandler;
