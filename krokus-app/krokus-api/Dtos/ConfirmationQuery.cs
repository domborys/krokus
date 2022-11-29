namespace krokus_api.Dtos
{
    public class ConfirmationQuery : PaginatedQuery
    {
        public long? ObservationId { get; set; }
        public string? UserId { get; set; }
    }
}
