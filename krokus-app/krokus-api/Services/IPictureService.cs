using krokus_api.Dtos;

namespace krokus_api.Services
{
    /// <summary>
    /// A service for managing pictures added to confirmations.
    /// </summary>
    public interface IPictureService
    {
        /// <summary>
        /// Adds a picture.
        /// </summary>
        /// <param name="fileUploadDto">Picture to add.</param>
        /// <returns>List of the details of created picture.</returns>
        public Task<List<PictureDetailsDto>> CreatePictures(PictureUploadDto fileUploadDto);
        /// <summary>
        /// Gets the details of a picture by id.
        /// </summary>
        /// <param name="id">Id of the picture.</param>
        /// <returns>Details of the picture with the specified id.</returns>
        public Task<PictureDetailsDto?> GetFileDetails(long id);
        /// <summary>
        /// Gets the infromation for downloading the picture.
        /// </summary>
        /// <param name="id">Id of the picture</param>
        /// <returns>Infromation for downloading the picture.</returns>
        public Task<string?> GetFilePath(long id);
        /// <summary>
        /// Finds a file path of a picture.
        /// </summary>
        /// <param name="id">Id of a picture.</param>
        /// <returns>Path of a picture.</returns>
        public Task<FileDownloadData?> GetFileDownloadData(long id);
        /// <summary>
        /// Deletes a file with an id.
        /// </summary>
        /// <param name="id">Id of a file.</param>
        /// <returns>true if successful.</returns>
        public Task<bool> DeleteFile(long id);

    }
}
