namespace krokus_api.Models
{
    public class Picture
    {
        public long Id { get; set; }
        public string Filename { get; set; } = default!;
        public long ConfirmationId { get; set; }
        public Confirmation Confirmation { get; set; } = default!;
    }
}
