using krokus_api.Dtos;
using krokus_api.Models;

namespace krokus_api.Services
{
    public interface ITagService
    {
        public Task<List<TagDto>> FindAllTags();
        public Task<PaginatedList<TagDto>> FindWithQuery(TagQuery queryData);
        public Task<TagDto?> FindById(long id);
        public Task<Tag?> FindByName(string name);
        public Task<TagDto> CreateTag(TagDto tagDto);

        public Task<bool> UpdateTag(TagDto tagDto);
        public Task<bool> DeleteTag(long id);
    }
}
