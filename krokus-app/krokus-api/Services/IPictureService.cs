using krokus_api.Dtos;

namespace krokus_api.Services
{
    public interface IPictureService
    {
        public Task<List<PictureDetailsDto>> CreatePictures(PictureUploadDto fileUploadDto);
        public Task<PictureDetailsDto?> GetFileDetails(long id);
        public Task<string?> GetFilePath(long id);
        public Task<FileDownloadData?> GetFileDownloadData(long id);
        public Task<bool> DeleteFile(long id);

    }
}
