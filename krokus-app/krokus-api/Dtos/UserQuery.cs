namespace krokus_api.Dtos
{
    public class UserQuery : PaginatedQuery
    {
        public string? Username { get; set; }
    }
}
