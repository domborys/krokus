using krokus_api.Consts;
using krokus_api.Dtos;
using krokus_api.Models;
using krokus_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace krokus_api.Controllers
{
    /// <summary>
    /// A controller for managing tags of observations.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class TagsController : ControllerBase
    {
        private readonly ITagService _tagService;
        public TagsController(ITagService tagService)
        {
            _tagService = tagService;
        }

        /// <summary>
        /// Gets the tags specified by a query.
        /// </summary>
        /// <param name="query">tag query</param>
        /// <returns>A paginated list of tags matching the query.</returns>
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<PaginatedList<TagDto>>> GetTags([FromQuery] TagQuery query)
        {
            return await _tagService.FindWithQuery(query);
        }

        /// <summary>
        /// Gets a tag by id.
        /// </summary>
        /// <param name="id">Id of the tag.</param>
        /// <returns>The tag with the specified id.</returns>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<TagDto>> GetTag(long id)
        {
            var tag = await _tagService.FindById(id);

            if (tag == null)
            {
                return NotFound();
            }

            return tag;
        }

        /// <summary>
        /// Adds a new tag.
        /// </summary>
        /// <param name="tagDto">The tag to add.</param>
        /// <returns>The newly created tag.</returns>
        [HttpPost]
        [Authorize(Policy = Policies.HasModeratorRights)]
        public async Task<ActionResult<TagDto>> PostTag(TagDto tagDto)
        {
            var createdTag = await _tagService.CreateTag(tagDto);

            return CreatedAtAction(nameof(GetTag), new { id = createdTag.Id }, createdTag);
        }

        /// <summary>
        /// Modifies a tag.
        /// </summary>
        /// <param name="id">Id of the tag.</param>
        /// <param name="tagDto">The tag to modify.</param>
        /// <returns>No Content on success.</returns>
        [HttpPut("{id}")]
        [Authorize(Policy = Policies.HasModeratorRights)]
        public async Task<IActionResult> PutTag(long id, TagDto tagDto)
        {
            if (id != tagDto.Id)
            {
                return BadRequest();
            }

            bool result = await _tagService.UpdateTag(tagDto);

            if (result)
            {
                return NoContent();
            }
            else
            {
                return NotFound();
            }
            
        }

        /// <summary>
        /// Deletes a tag.
        /// </summary>
        /// <param name="id">Id of the tag.</param>
        /// <returns>No content on success.</returns>
        [HttpDelete("{id}")]
        [Authorize(Policy = Policies.HasModeratorRights)]
        public async Task<IActionResult> DeleteTag(long id)
        {
            var result = await _tagService.DeleteTag(id);
            if (result)
            {
                return NoContent();
            }
            else
            {
                return NotFound();
            }
        }
    }
}
