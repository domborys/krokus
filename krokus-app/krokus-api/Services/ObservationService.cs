using krokus_api.Data;
using krokus_api.Dtos;
using krokus_api.Models;
using Microsoft.EntityFrameworkCore;

namespace krokus_api.Services
{
    public class ObservationService : IObservationService
    {
        private readonly AppDbContext _context;

        public ObservationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ObservationDto>> FindAllObservations()
        {
            return await _context.Observation.Include(obs => obs.Tags).Select(obs => new ObservationDto
            {
                Id = obs.Id,
                Title = obs.Title,
                UserId = obs.UserId,
                Location = new List<double>() { obs.Location.Coordinate.X, obs.Location.Coordinate.Y },
                Tags = obs.Tags.Select(tag => new TagDto() { Id = tag.Id, Name = tag.Name}).ToList(),

            }).ToListAsync();
        }

        public async Task<ObservationDto?> FindById(long id)
        {
            var obs = await _context.Observation.Include(obs => obs.Tags).Include(obs => obs.Confirmations).FirstOrDefaultAsync(obs => obs.Id == id);
            if (obs == null)
            {
                return null;
            }
            return EntityToDto(obs);
        }

        public async Task<ObservationDto> CreateObservation(ObservationDto obsDto)
        {
            Observation obs = new Observation
            {
                Title = obsDto.Title,
                UserId = obsDto.UserId,
                Location = new NetTopologySuite.Geometries.Point(obsDto.Location[0], obsDto.Location[1]) { SRID = 4326 },
                Tags = await PrepareTags(obsDto.Tags)
            };
            if(obsDto.Confirmations != null)
            {
                obs.Confirmations = obsDto.Confirmations.Select(conf => new Confirmation { 
                    IsConfirmed = conf.IsConfirmed,
                    DateTime = conf.DateTime,
                    Description= conf.Description,
                    UserId = conf.UserId,
                }).ToList();
            }
            _context.Observation.Add(obs);
            await _context.SaveChangesAsync();
            return EntityToDto(obs);
        }

        public async Task<bool> UpdateObservation(ObservationDto obsDto)
        {
            Observation? obs = await _context.Observation.Include(obs => obs.Tags).FirstOrDefaultAsync(obs => obs.Id == obsDto.Id);
            if (obs == null)
            {
                return false;
            }
            obs.Title = obsDto.Title;
            obs.UserId = obsDto.UserId;
            obs.Location = new NetTopologySuite.Geometries.Point(obsDto.Location[0], obsDto.Location[1]) { SRID = 4326 };
            obs.Tags = await PrepareTags(obsDto.Tags);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteObservation(long id)
        {
            Observation? obs = await _context.Observation.FindAsync(id);
            if (obs == null)
            {
                return false;
            }
            _context.Observation.Remove(obs);
            await _context.SaveChangesAsync();
            return true;
        }

        private async Task<List<Tag>> PrepareTags(List<TagDto>? tagDtos)
        {
            if(tagDtos == null)
            {
                return new List<Tag>();
            }

            var tags = new List<Tag>();
            foreach(var tagDto in tagDtos)
            {
                tags.Add(await TagDtoToEntity(tagDto));
            }
            return tags;
        }

        private async Task<Tag> TagDtoToEntity(TagDto tagDto)
        {
            if(tagDto.Id == null)
            {
                var existingEntity = await _context.Tag.Where(t => t.Name == tagDto.Name).FirstOrDefaultAsync();
                return existingEntity ?? new Tag { Name = tagDto.Name };
            }
            else
            {
                var existingEntity = await _context.Tag.Where(t => t.Id == tagDto.Id).FirstOrDefaultAsync();
                return existingEntity ?? new Tag { Name = tagDto.Name };
            }
        }

        private ObservationDto EntityToDto(Observation obs)
        {
            return new ObservationDto
            {
                Id = obs.Id,
                Title = obs.Title,
                UserId = obs.UserId,
                Location = new List<double>() { obs.Location.Coordinate.X, obs.Location.Coordinate.Y },
                Tags = obs.Tags.Select(tag => new TagDto() { Id = tag.Id, Name = tag.Name }).ToList(),
                Confirmations = obs.Confirmations?.Select(conf => new ConfirmationDto
                {
                    Id = conf.Id,
                    IsConfirmed = conf.IsConfirmed,
                    DateTime = conf.DateTime,
                    Description = conf.Description,
                    UserId = conf.UserId,
                    ObservationId = obs.Id,
                })?.ToList() ?? new List<ConfirmationDto>()
            };
        }

    }
}
