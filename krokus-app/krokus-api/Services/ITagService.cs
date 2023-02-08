using krokus_api.Dtos;
using krokus_api.Models;

namespace krokus_api.Services
{
    /// <summary>
    /// Service for managing tags.
    /// </summary>
    public interface ITagService
    {
        /// <summary>
        /// Finds all tags.
        /// </summary>
        /// <returns>List of all tags.</returns>
        public Task<List<TagDto>> FindAllTags();
        /// <summary>
        /// Finds a tag using a query.
        /// </summary>
        /// <param name="queryData">The query for searching the tags.</param>
        /// <returns>Paginated list of tags.</returns>
        public Task<PaginatedList<TagDto>> FindWithQuery(TagQuery queryData);
        /// <summary>
        /// Finds a tag by id.
        /// </summary>
        /// <param name="id">Id of the tag.</param>
        /// <returns>The tag with the specified id.</returns>
        public Task<TagDto?> FindById(long id);
        /// <summary>
        /// Finds a tag by name.
        /// </summary>
        /// <param name="name">Name of the tag.</param>
        /// <returns>Tag with the name.</returns>
        public Task<Tag?> FindByName(string name);
        /// <summary>
        /// Adds a tag.
        /// </summary>
        /// <param name="tagDto">Tag to be added.</param>
        /// <returns>The newly created tag.</returns>
        public Task<TagDto> CreateTag(TagDto tagDto);
        /// <summary>
        /// Updates a tag.
        /// </summary>
        /// <param name="tagDto">New version of a tag.</param>
        /// <returns>true if successful</returns>
        public Task<bool> UpdateTag(TagDto tagDto);
        /// <summary>
        /// Deletes a tag.
        /// </summary>
        /// <param name="id">Id of the tag.</param>
        /// <returns>true if successful.</returns>
        public Task<bool> DeleteTag(long id);
    }
}
