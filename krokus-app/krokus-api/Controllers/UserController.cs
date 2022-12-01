using krokus_api.Consts;
using krokus_api.Dtos;
using krokus_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NuGet.Protocol.Plugins;

namespace krokus_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _authenticationService;

        public UserController(IUserService authenticationService)
        {
            _authenticationService = authenticationService;
        }

        [AllowAnonymous]
        [HttpPost("Login")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Login([FromBody] LoginDto request)
        {
            var response = await _authenticationService.Login(request);

            return Ok(response);
        }

        [AllowAnonymous]
        [HttpPost("Register")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register([FromBody] RegisterDto request)
        {
            var response = await _authenticationService.Register(request);

            return Ok(response);
        }

        [HttpGet("Me")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserDto))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Me()
        {
            var response = await _authenticationService.GetCurrentUser();

            return Ok(response);
        }

        [HttpGet("All")]
        [Authorize(Policy = Policies.HasModeratorRights)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<UserDto>))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetAll()
        {
            var response = await _authenticationService.GetAllUsers();

            return Ok(response);
        }

        [HttpPost("ChangePassword")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] PasswordChangeDto passwordChangeDto)
        {
            var result = await _authenticationService.ChangePassword(passwordChangeDto);
            if (result.Succeeded)
            {
                return Ok();
            }
            else
            {
                return Forbid();
            }
        }

        [HttpGet("{id}")]
        [Authorize(Policy = Policies.HasUserRights)]
        public async Task<ActionResult<UserDto>> GetUser(string id)
        {
            var user = await _authenticationService.FindById(id);
            if(user == null)
            {
                return NotFound();
            }
            return user;
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = Policies.HasAdminRights)]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var result = await _authenticationService.DeleteUser(id);
            if (result)
            {
                return NoContent();
            }
            else
            {
                return NotFound();
            }
        }

        [HttpPut("{id}/Role")]
        [Authorize(Policy = Policies.HasAdminRights)]
        public async Task<ActionResult> SetUserRole(string id, [FromBody] SetRoleDto setRoleDto)
        {
            await _authenticationService.SetUserRole(id, setRoleDto.Role);
            return Ok();
        }
    }
}
