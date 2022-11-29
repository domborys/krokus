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

namespace krokus_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ObservationsController : ControllerBase
    {
        private readonly IObservationService _observationService;

        public ObservationsController(IObservationService observationService)
        {
            _observationService = observationService;
        }

        // GET: api/Observations
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<PaginatedList<ObservationDto>>> GetObservations([FromQuery] ObservationQuery query)
        {
            return await _observationService.FindWithQuery(query);
        }
        /*
        public async Task<ActionResult<IEnumerable<ObservationDto>>> GetAllObsesrvations()
        {
            return await _observationService.FindAllObservations();
        }*/

        // GET: api/Observations/5
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

        [HttpPost]
        [Authorize(Policy = Policies.HasUserRights)]
        public async Task<ActionResult<TagDto>> PostObservation(ObservationDto obsDto)
        {
            var createdObs = await _observationService.CreateObservation(obsDto);

            return CreatedAtAction(nameof(GetObservation), new { id = createdObs.Id }, createdObs);
        }

        // PUT: api/Observations/5
        [HttpPut("{id}")]
        [Authorize(Policy = Policies.HasModeratorRights)]
        public async Task<IActionResult> PutObservation(long id, ObservationDto obsDto)
        {
            if (id != obsDto.Id)
            {
                return BadRequest();
            }

            bool result = await _observationService.UpdateObservation(obsDto);

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
        public async Task<IActionResult> DeleteObservation(long id)
        {
            var result = await _observationService.DeleteObservation(id);
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
