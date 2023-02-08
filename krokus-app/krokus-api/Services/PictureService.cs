using krokus_api.Data;
using krokus_api.Dtos;
using krokus_api.Models;
using Microsoft.AspNetCore.Http;
using NuGet.Versioning;

namespace krokus_api.Services
{
    /// <summary>
    /// A service for managing pictures added to confirmations.
    /// </summary>
    public class PictureService : IPictureService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private long maxFileSize = 1048576;
        private string imageFolder = string.Empty;
        private List<string> allowedExtensions = new List<string>();

        public PictureService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
            ReadConfiguration();
            CreatePictureFolder();
        }

        /// <summary>
        /// Adds a picture.
        /// </summary>
        /// <param name="fileUploadDto">Picture to add.</param>
        /// <returns>List of the details of created picture.</returns>
        public async Task<List<PictureDetailsDto>> CreatePictures(PictureUploadDto fileUploadDto)
        {
            ValidateUploadedPictures(fileUploadDto.Files);
            List<PictureDetailsDto> pictureDtos = new();
            foreach(var file in fileUploadDto.Files)
            {
                PictureDetailsDto pictureDto = await SavePicture(file, fileUploadDto.ConfirmationId);
                pictureDtos.Add(pictureDto);
            }
            return pictureDtos;
        }

        private async Task<PictureDetailsDto> SavePicture(IFormFile file, long confirmationId)
        {
            string ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            string fileName = Guid.NewGuid().ToString() + ext;
            string filePath = FormFilePath(fileName);
            using (var stream = File.Create(filePath))
            {
                await file.CopyToAsync(stream);
            }
            var picture = new Picture
            {
                Filename = fileName,
                ConfirmationId = confirmationId,
            };
            _context.Picture.Add(picture);
            await _context.SaveChangesAsync();
            return EntityToDto(picture);
        }

        /// <summary>
        /// Gets the details of a picture by id.
        /// </summary>
        /// <param name="id">Id of the picture.</param>
        /// <returns>Details of the picture with the specified id.</returns>
        public async Task<PictureDetailsDto?> GetFileDetails(long id)
        {
            var picture = await _context.Picture.FindAsync(id);
            if(picture == null)
            {
                return null;
            }
            return EntityToDto(picture);
        }

        /// <summary>
        /// Gets the infromation for downloading the picture.
        /// </summary>
        /// <param name="id">Id of the picture</param>
        /// <returns>Infromation for downloading the picture.</returns>
        public async Task<FileDownloadData?> GetFileDownloadData(long id)
        {
            var picture = await _context.Picture.FindAsync(id);
            if (picture == null)
            {
                return null;
            }
            return new FileDownloadData { 
                FilePath = FormFilePath(picture.Filename),
                DownloadName = FormDownloadName(picture)
            };
        }

        /// <summary>
        /// Finds a file path of a picture.
        /// </summary>
        /// <param name="id">Id of a picture.</param>
        /// <returns>Path of a picture.</returns>
        public async Task<string?> GetFilePath(long id)
        {
            var picture = await _context.Picture.FindAsync(id);
            if (picture == null)
            {
                return null;
            }
            return FormFilePath(picture.Filename);
        }

        /// <summary>
        /// Deletes a file with an id.
        /// </summary>
        /// <param name="id">Id of a file.</param>
        /// <returns>true if successful.</returns>
        public async Task<bool> DeleteFile(long id)
        {
            var picture = await _context.Picture.FindAsync(id);
            if (picture == null)
            {
                return false;
            }
            var filePath = FormFilePath(picture.Filename);
            File.Delete(filePath);
            _context.Picture.Remove(picture);
            await _context.SaveChangesAsync();
            return true;
        }

        public string FormFilePath(string fileName)
        {
            return Path.GetFullPath(Path.Combine(imageFolder, fileName));
        }

        public string FormDownloadName(Picture picture)
        {
            string ext = Path.GetExtension(picture.Filename);
            string name = $"{picture.ConfirmationId}-{picture.Id}{ext}";
            return name;
        }

        private void ReadConfiguration()
        {
            long.TryParse(_configuration["ImageStorage:MaxFileSize"], out maxFileSize);
            imageFolder = _configuration["ImageStorage:Folder"] ?? "Pictures";
            allowedExtensions = _configuration.GetSection("ImageStorage:AllowedExtensions").Get<List<string>>();
        }

        private void CreatePictureFolder()
        {
            Directory.CreateDirectory(imageFolder);
        }

        private void ValidateUploadedPictures(IEnumerable<IFormFile> files)
        {
            foreach(var file in files)
            {
                ValidateUploadedPicture(file);
            }
        }

        private void ValidateUploadedPicture(IFormFile file)
        {
            string fileName = file.FileName;
            if (file.Length > maxFileSize)
            {
                throw new ArgumentException($"File {fileName} is too large. Max file size is {maxFileSize}");
            }
            string extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
            {
                throw new ArgumentException($"Extension {extension} is not allowed. The only allowed extensions are: {string.Join(", ",allowedExtensions)}");
            }
        }

        private static PictureDetailsDto EntityToDto(Picture picture)
        {
            return new PictureDetailsDto
            {
                Id = picture.Id,
                ConfirmationId = picture.ConfirmationId,
            };
        }
    }

    public class FileDownloadData
    {
        public string FilePath { get; set; } = string.Empty;
        public string DownloadName { get; set; } = string.Empty;
    }
}
