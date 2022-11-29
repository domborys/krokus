using krokus_api.Models;
using NetTopologySuite.Features;
using NetTopologySuite.Geometries;

namespace krokus_api.Dtos
{
    public class ObservationDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = default!;
        public string? UserId { get; set; }
        public Point? Location { get; set; }
        public Polygon? Boundary { get; set; }
        public List<TagDto>? Tags { get; set; }
        public List<ConfirmationDto>? Confirmations { get; set; }
    }
}
