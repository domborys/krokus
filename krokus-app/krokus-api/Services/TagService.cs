using krokus_api.Data;
using krokus_api.Dtos;
using krokus_api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace krokus_api.Services
{
    /// <summary>
    /// Service for managing tags.
    /// </summary>
    public class TagService : ITagService
    {
        private readonly AppDbContext _context;

        public TagService(AppDbContext context)
        {
            _context = context;
        }
        /// <summary>
        /// Finds all tags.
        /// </summary>
        /// <returns>List of all tags.</returns>
        public async Task<List<TagDto>> FindAllTags()
        {
            return await _context.Tag.Select(tag => EntityToDto(tag)).ToListAsync();
        }

        /// <summary>
        /// Finds a tag using a query.
        /// </summary>
        /// <param name="queryData">The query for searching the tags.</param>
        /// <returns>Paginated list of tags.</returns>
        public async Task<PaginatedList<TagDto>> FindWithQuery(TagQuery queryData)
        {
            IQueryable<Tag> query = _context.Tag;
            if (queryData.Name is not null)
            {
                query = query.Where(tag => tag.Name.Contains(queryData.Name));
            }
            var source = query.OrderBy(tag => tag.Name).Select(tag => EntityToDto(tag));
            return await PaginatedList<TagDto>.QueryAsync(source, queryData.PageIndex, queryData.PageSize);
        }

        /// <summary>
        /// Finds a tag by id.
        /// </summary>
        /// <param name="id">Id of the tag.</param>
        /// <returns>The tag with the specified id.</returns>
        public async Task<TagDto?> FindById(long id)
        {
            var tag = await _context.Tag.FindAsync(id);
            if(tag == null)
            {
                return null;
            }
            return EntityToDto(tag);
        }

        /// <summary>
        /// Finds a tag by name.
        /// </summary>
        /// <param name="name">Name of the tag.</param>
        /// <returns>Tag with the name.</returns>
        public async Task<Tag?> FindByName(string name)
        {
            return await _context.Tag.Where(tag => tag.Name == name).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Adds a tag.
        /// </summary>
        /// <param name="tagDto">Tag to be added.</param>
        /// <returns>The newly created tag.</returns>
        public async Task<TagDto> CreateTag(TagDto tagDto)
        {
            Tag tag = new()
            {
                Name = tagDto.Name
            };
            _context.Tag.Add(tag);
            await _context.SaveChangesAsync();
            return EntityToDto(tag);
        }

        /// <summary>
        /// Updates a tag.
        /// </summary>
        /// <param name="tagDto">New version of a tag.</param>
        /// <returns>true if successful</returns>
        public async Task<bool> UpdateTag(TagDto tagDto)
        {
            Tag? tag = await _context.Tag.FindAsync(tagDto.Id);
            if(tag == null)
            {
                return false;
            }
            tag.Name = tagDto.Name;
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Deletes a tag.
        /// </summary>
        /// <param name="id">Id of the tag.</param>
        /// <returns>true if successful.</returns>
        public async Task<bool> DeleteTag(long id)
        {
            Tag? tag = await _context.Tag.FindAsync(id);
            if(tag == null)
            {
                return false;
            }
            _context.Tag.Remove(tag);
            await _context.SaveChangesAsync();
            return true;
        }

        private static TagDto EntityToDto(Tag tag)
        {
            return new TagDto()
            {
                Id = tag.Id,
                Name = tag.Name,
            };
        }
    }
}
