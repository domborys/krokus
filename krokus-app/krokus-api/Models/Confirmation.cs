namespace krokus_api.Models
{
    public class Confirmation
    {
        public long Id { get; set; }
        public bool IsConfirmed { get; set; }
        public DateTime DateTime { get; set; }
        public string? UserId { get; set; }
        public User? User { get; set; }
        public string? Description { get; set; }

        public long? ObservationId { get; set; }
        public Observation? Observation { get; set; }
        public List<Picture>? Pictures { get; set; }
    }
}
