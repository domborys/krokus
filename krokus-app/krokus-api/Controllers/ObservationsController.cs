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

namespace krokus_api.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class ObservationsController : ControllerBase
    {
        private readonly ObservationContext _context;

        public ObservationsController(ObservationContext context)
        {
            _context = context;
        }

        // GET: api/Observations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Observation>>> GetObservation()
        {
            return await _context.Observation.ToListAsync();
        }

        // GET: api/Observations/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Observation>> GetObservation(long id)
        {
            var observation = await _context.Observation.FindAsync(id);

            if (observation == null)
            {
                return NotFound();
            }

            return observation;
        }

        // PUT: api/Observations/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutObservation(long id, Observation observation)
        {
            if (id != observation.Id)
            {
                return BadRequest();
            }

            _context.Entry(observation).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ObservationExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Observations
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Observation>> PostObservation(Observation observation)
        {
            _context.Observation.Add(observation);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetObservation), new { id = observation.Id }, observation);
        }

        // DELETE: api/Observations/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteObservation(long id)
        {
            var observation = await _context.Observation.FindAsync(id);
            if (observation == null)
            {
                return NotFound();
            }

            _context.Observation.Remove(observation);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ObservationExists(long id)
        {
            return _context.Observation.Any(e => e.Id == id);
        }
    }
}
