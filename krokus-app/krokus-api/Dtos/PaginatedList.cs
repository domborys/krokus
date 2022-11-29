using Microsoft.EntityFrameworkCore;

namespace krokus_api.Dtos
{
    public class PaginatedList<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public int TotalItems { get; set; }

        public PaginatedList()
        {

        }

        public PaginatedList(List<T> items, int pageIndex, int pageSize, int totalItems)
        {
            Items = items;
            PageIndex = pageIndex;
            PageSize = pageSize;
            TotalItems = totalItems;
            TotalPages = totalItems/pageSize + (totalItems%pageSize > 0 ? 1 : 0);
        }

        public static async Task<PaginatedList<T>> QueryAsync(IQueryable<T> source, int pageIndex, int pageSize)
        {
            int count = await source.CountAsync();
            int skip = (pageIndex - 1) * pageSize;
            var items = await source.Skip(skip).Take(pageSize).ToListAsync();
            return new PaginatedList<T>(items, pageIndex, pageSize, count);
        }
    }
}
