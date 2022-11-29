namespace krokus_api.Dtos
{
    public class PaginatedQuery
    {
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}
