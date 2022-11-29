using krokus_api.Data;
using krokus_api.Dtos;
using krokus_api.Models;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

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
                Location = obs.Location,
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

        public async Task<PaginatedList<ObservationDto>> FindWithQuery(ObservationQuery queryData)
        {
            IQueryable<Observation> query = _context.Observation;
            if(queryData.Tag is not null)
            {
                query = query.Where(obs => obs.Tags.Where(tag => queryData.Tag.Contains(tag.Name)).Any());
            }
            if(queryData.Title is not null)
            {
                query = query.Where(obs => obs.Title.Contains(queryData.Title));
            }
            var source = query.Include(obs => obs.Tags).Select(obs => new ObservationDto
            {
                Id = obs.Id,
                Title = obs.Title,
                UserId = obs.UserId,
                Location = obs.Location,
                Tags = obs.Tags.Select(tag => new TagDto() { Id = tag.Id, Name = tag.Name }).ToList(),

            }).OrderBy(obs => obs.Id);
            return await PaginatedList<ObservationDto>.QueryAsync(source, queryData.PageIndex, queryData.PageSize);
        }

        public async Task<ObservationDto> CreateObservation(ObservationDto obsDto)
        {
            if (obsDto.Location is not null)
                obsDto.Location.SRID = 4326;
            Observation obs = new Observation
            {
                Title = obsDto.Title,
                UserId = obsDto.UserId,
                Location = DetermineLocation(obsDto),
                Boundary = obsDto.Boundary,
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
            if (obsDto.Location is not null)
                obsDto.Location.SRID = 4326;
            obs.Title = obsDto.Title;
            obs.UserId = obsDto.UserId;
            obs.Location = DetermineLocation(obsDto);
            obs.Boundary = obsDto.Boundary;
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

        private Point DetermineLocation(ObservationDto obsDto)
        {
            if(obsDto.Boundary is null)
            {
                return obsDto.Location ?? new Point(0,0);
            }
            else
            {
                return obsDto.Boundary.Centroid;
            }
        }

        private ObservationDto EntityToDto(Observation obs)
        {
            return new ObservationDto
            {
                Id = obs.Id,
                Title = obs.Title,
                UserId = obs.UserId,
                Location = obs.Location,
                Boundary = obs.Boundary,
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
