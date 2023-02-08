using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using krokus_api.Data;
using krokus_api.Models;
using Microsoft.AspNetCore.Authorization;
using krokus_api.Services;
using krokus_api.Dtos;
using Azure;
using krokus_api.Consts;
using System.Security.Claims;

namespace krokus_api.Controllers
{
    /// <summary>
    /// A controller which handles the observations.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class ObservationsController : ControllerBase
    {
        private readonly IObservationService _observationService;
        private readonly IAuthorizationService _authorizationService;
        public ObservationsController(IObservationService observationService, IAuthorizationService authorizationService)
        {
            _observationService = observationService;
            _authorizationService = authorizationService;
        }

        /// <summary>
        /// Gets the observations matching the query.
        /// </summary>
        /// <param name="query">The query for observations.</param>
        /// <returns>A paginated list of observations.</returns>
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<PaginatedList<ObservationDto>>> GetObservations([FromQuery] ObservationQuery query)
        {
            return await _observationService.FindWithQuery(query);
        }

        /// <summary>
        /// Gets the observation by id.
        /// </summary>
        /// <param name="id">Id of the observation.</param>
        /// <returns>The observation with the specified id or Not Found.</returns>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ObservationDto>> GetObservation(long id)
        {
            var obs = await _observationService.FindById(id);

            if (obs == null)
            {
                return NotFound();
            }

            return obs;
        }

        /// <summary>
        /// Adds an observation.
        /// </summary>
        /// <param name="obsDto">The observation to add.</param>
        /// <returns>The newly created observation.</returns>
        [HttpPost]
        [Authorize(Policy = Policies.HasUserRights)]
        public async Task<ActionResult<TagDto>> PostObservation(ObservationDto obsDto)
        {
            if(obsDto.UserId == null || obsDto.UserId != User.FindFirstValue(ClaimTypes.NameIdentifier))
            {
                return BadRequest("UserId must be the same as the id of currently logged-in user.");
            }
            var createdObs = await _observationService.CreateObservation(obsDto);

            return CreatedAtAction(nameof(GetObservation), new { id = createdObs.Id }, createdObs);
        }

        /// <summary>
        /// Modifies the observation
        /// </summary>
        /// <param name="id">Id of the observation.</param>
        /// <param name="obsDto">New version of the observation.</param>
        /// <returns>No Content on success.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> PutObservation(long id, ObservationDto obsDto)
        {
            if (id != obsDto.Id)
            {
                return BadRequest();
            }
            var currentObs = await _observationService.FindById(id);
            if(currentObs == null)
            {
                return NotFound();
            }
            var authResult = await _authorizationService.AuthorizeAsync(User, currentObs, Policies.IsAuthorOrHasModeratorRights);
            if (authResult.Succeeded)
            {
                bool result = await _observationService.UpdateObservation(obsDto);
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

        /// <summary>
        /// Deletes an observation.
        /// </summary>
        /// <param name="id">Id of the observation.</param>
        /// <returns>No content on success.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteObservation(long id)
        {
            var currentObs = await _observationService.FindById(id);
            if (currentObs == null)
            {
                return NotFound();
            }
            var authResult = await _authorizationService.AuthorizeAsync(User, currentObs, Policies.IsAuthorOrHasModeratorRights);
            if (authResult.Succeeded)
            {
                var result = await _observationService.DeleteObservation(id);
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
