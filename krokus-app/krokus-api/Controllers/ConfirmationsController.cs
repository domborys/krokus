using krokus_api.Consts;
using krokus_api.Dtos;
using krokus_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace krokus_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConfirmationsController : ControllerBase
    {
        private readonly IConfirmationService _confirmationService;

        public ConfirmationsController(IConfirmationService confirmationService)
        {
            _confirmationService = confirmationService;
        }

        /*
        public async Task<ActionResult<IEnumerable<ConfirmationDto>>> GetAllConfirmations()
        {
            return Ok(await _confirmationService.FindAllConfirmations());
        }*/

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ConfirmationDto>>> GetConfirmations([FromQuery] ConfirmationQuery query)
        {
            return Ok(await _confirmationService.FindWithQuery(query));
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ConfirmationDto>> GetConfirmationById(long id)
        {
            var conf = await _confirmationService.FindById(id);
            if(conf == null)
            {
                return NotFound();
            }
            return Ok(conf);
        }

        [HttpPost]
        [Authorize(Policy = Policies.HasUserRights)]
        public async Task<ActionResult<ConfirmationDto>> PostConfirmation(ConfirmationDto confDto)
        {
            var createdConf = await _confirmationService.CreateConfirmation(confDto);
            return Ok(createdConf);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = Policies.HasModeratorRights)]
        public async Task<IActionResult> PutConfirmation(long id, ConfirmationDto confDto)
        {
            if (id != confDto.Id)
            {
                return BadRequest();
            }
            bool result = await _confirmationService.UpdateConfirmation(confDto);

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
        public async Task<IActionResult> DeleteConfirmation(long id)
        {
            var result = await _confirmationService.DeleteConfirmation(id);
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
