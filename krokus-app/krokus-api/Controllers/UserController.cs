using Azure;
using krokus_api.Consts;
using krokus_api.Dtos;
using krokus_api.Exceptions;
using krokus_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NuGet.Protocol.Plugins;

namespace krokus_api.Controllers
{
    /// <summary>
    /// Controller for managing users, account creation and authentication.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _authenticationService;

        public UserController(IUserService authenticationService)
        {
            _authenticationService = authenticationService;
        }

        /// <summary>
        /// Logs in the user.
        /// </summary>
        /// <param name="request">Login request.</param>
        /// <returns>Application token.</returns>
        [AllowAnonymous]
        [HttpPost("Login")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Login([FromBody] LoginDto request)
        {
            try
            {
                var response = await _authenticationService.Login(request);
                return Ok(response);
            }
            catch(LoginException e)
            {
                return Problem(statusCode: 403, title: e.Message);
                //return Unauthorized(e.Message);
            }
            
        }

        /// <summary>
        /// Adds an account.
        /// </summary>
        /// <param name="request">User registration data.</param>
        /// <returns>The newly created user.</returns>
        [AllowAnonymous]
        [HttpPost("Register")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register([FromBody] RegisterDto request)
        {
            var createdUser = await _authenticationService.Register(request);
            return CreatedAtAction(nameof(GetUser), new { id = createdUser.Id }, createdUser);
            //return Ok(response);
        }

        /// <summary>
        /// Gets the information about the currently logged-in user.
        /// </summary>
        /// <returns></returns>
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

        /// <summary>
        /// Gets a list of users matching the query.
        /// </summary>
        /// <param name="query">The query for users.</param>
        /// <returns>Paginated list of users matching the query.</returns>
        [HttpGet]
        [Authorize(Policy = Policies.HasModeratorRights)]
        public async Task<ActionResult<PaginatedList<UserDto>>> GetUsers([FromQuery] UserQuery query)
        {
            return await _authenticationService.FindWithQuery(query);
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

        /// <summary>
        /// Changes the password of the currently logged-in user.
        /// </summary>
        /// <param name="passwordChangeDto">Old and new password.</param>
        /// <returns>No Content on success.</returns>
        [HttpPost("ChangePassword")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] PasswordChangeDto passwordChangeDto)
        {
            var result = await _authenticationService.ChangePassword(passwordChangeDto);
            if (result.Succeeded)
            {
                return NoContent();
            }
            else
            {
                return Forbid();
            }
        }

        /// <summary>
        /// Gets a user by id.
        /// </summary>
        /// <param name="id">Id of the user.</param>
        /// <returns>The user with the specified id.</returns>
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

        /// <summary>
        /// Deletes the user.
        /// </summary>
        /// <param name="id">Id of the user.</param>
        /// <returns>No Content on success.</returns>
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
            return NoContent();
        }

        [HttpPut("{id}/Ban")]
        [Authorize(Policy = Policies.HasModeratorRights)]
        public async Task<ActionResult> SetUserBan(string id, [FromBody] UserBanDto userBanDto)
        {
            await _authenticationService.SetUserBan(id, userBanDto);
            return NoContent();
        }
    }
}
