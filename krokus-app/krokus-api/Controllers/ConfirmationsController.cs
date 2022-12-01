using krokus_api.Consts;
using krokus_api.Dtos;
using krokus_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace krokus_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConfirmationsController : ControllerBase
    {
        private readonly IConfirmationService _confirmationService;
        private readonly IAuthorizationService _authorizationService;

        public ConfirmationsController(IConfirmationService confirmationService, IAuthorizationService authorizationService)
        {
            _confirmationService = confirmationService;
            _authorizationService = authorizationService;
        }

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
            if (confDto.UserId == null || confDto.UserId != User.FindFirstValue(ClaimTypes.NameIdentifier))
            {
                return BadRequest("UserId must be the same as the id of currently logged-in user.");
            }
            var createdConf = await _confirmationService.CreateConfirmation(confDto);
            return Ok(createdConf);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutConfirmation(long id, ConfirmationDto confDto)
        {
            if (id != confDto.Id)
            {
                return BadRequest();
            }
            var currentConf = await _confirmationService.FindById(id);
            if (currentConf == null)
            {
                return NotFound();
            }
            var authResult = await _authorizationService.AuthorizeAsync(User, currentConf, Policies.IsAuthorOrHasModeratorRights);
            if (authResult.Succeeded)
            {
                bool result = await _confirmationService.UpdateConfirmation(confDto);
                return NoContent();
            }
            else if (User.Identity?.IsAuthenticated ?? false)
            {
                return Forbid();
            }
            else
            {
                return Unauthorized();
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteConfirmation(long id)
        {
            var currentConf = await _confirmationService.FindById(id);
            if (currentConf == null)
            {
                return NotFound();
            }
            var authResult = await _authorizationService.AuthorizeAsync(User, currentConf, Policies.IsAuthorOrHasModeratorRights);
            if (authResult.Succeeded)
            {
                var result = await _confirmationService.DeleteConfirmation(id);
                return NoContent();
            }
            else if (User.Identity?.IsAuthenticated ?? false)
            {
                return Forbid();
            }
            else
            {
                return Unauthorized();
            }
        }
    }
}
