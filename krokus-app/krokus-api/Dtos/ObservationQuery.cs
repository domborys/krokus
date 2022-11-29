namespace krokus_api.Dtos
{
    public class ObservationQuery : PaginatedQuery
    {
        
        public List<string>? Tag { get; set; }
        public string? Title { get; set; }
        public double? Xmin { get; set; }
        public double? Ymin { get; set; }
        public double? Xmax { get; set; }
        public double? Ymax { get; set; }

    }
}
