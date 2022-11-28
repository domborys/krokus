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
    [Route("api/[controller]")]
    [ApiController]
    public class TagsController : ControllerBase
    {
        private readonly ITagService _tagService;
        public TagsController(ITagService tagService)
        {
            _tagService = tagService;
        }

        [HttpGet]
        [Authorize(Policy = Policies.HasUserRights)]
        public async Task<ActionResult<IEnumerable<TagDto>>> GetAllTags()
        {
            return await _tagService.FindAllTags();
        }

        [HttpGet("{id}")]
        [Authorize(Policy = Policies.HasUserRights)]
        public async Task<ActionResult<TagDto>> GetTag(long id)
        {
            var tag = await _tagService.FindById(id);

            if (tag == null)
            {
                return NotFound();
            }

            return tag;
        }

        [HttpPost]
        [Authorize(Policy = Policies.HasModeratorRights)]
        public async Task<ActionResult<TagDto>> PostTag(TagDto tagDto)
        {
            var createdTag = await _tagService.CreateTag(tagDto);

            return CreatedAtAction(nameof(GetTag), new { id = createdTag.Id }, createdTag);
        }

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
