namespace krokus_api.Dtos
{
    public class ConfirmationDto : IResourceWithUserId
    {
        public long Id { get; set; }
        public bool IsConfirmed { get; set; }
        public DateTime DateTime { get; set; }
        public string? Description { get; set; }
        public string? UserId { get; set; }
        public long? ObservationId { get; set; }
        public List<PictureDetailsDto>? Pictures { get; set; }
    }
}
