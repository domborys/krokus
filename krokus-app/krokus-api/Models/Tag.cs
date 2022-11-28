namespace krokus_api.Models
{
    public class Tag
    {
        public long Id { get; set; }
        public string Name { get; set; } = default!;
        public List<Observation> Observations { get; set; } = default!;
    }
}
