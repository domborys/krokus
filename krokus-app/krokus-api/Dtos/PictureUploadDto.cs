namespace krokus_api.Dtos
{
    public class PictureUploadDto
    {
        public List<IFormFile> Files { get; set; } = default!;
        public long ConfirmationId { get; set; }
    }
}
