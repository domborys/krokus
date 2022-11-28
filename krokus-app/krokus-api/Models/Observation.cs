using NetTopologySuite.Geometries;

namespace krokus_api.Models
{
    public class Observation
    {
        public long Id { get; set; }
        public string Title { get; set; } = default!;
        public string? UserId { get; set; }
        public User? User { get; set; }
        public Point Location { get; set; } = default!;
        public Polygon? Boundary { get; set; }
        public List<Confirmation> Confirmations { get; set; } = default!;
        public List<Tag> Tags { get; set; } = default!;
    }
}
