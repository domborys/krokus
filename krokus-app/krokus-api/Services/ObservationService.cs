using krokus_api.Data;
using krokus_api.Dtos;
using krokus_api.Models;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace krokus_api.Services
{
    /// <summary>
    /// Service managing observations.
    /// </summary>
    public class ObservationService : IObservationService
    {
        private readonly AppDbContext _context;

        public ObservationService(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Finds all observations.
        /// </summary>
        /// <returns>The list of all observations.</returns>
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

        /// <summary>
        /// Finds an observation by id.
        /// </summary>
        /// <param name="id">Id of the observation.</param>
        /// <returns>The observation with the provided id.</returns>
        public async Task<ObservationDto?> FindById(long id)
        {
            var obs = await _context.Observation.Include(obs => obs.Tags).Include(obs => obs.Confirmations).Include(obs => obs.User).FirstOrDefaultAsync(obs => obs.Id == id);
            if (obs == null)
            {
                return null;
            }
            return EntityToDto(obs);
        }

        /// <summary>
        /// Finds observations according to a query.
        /// </summary>
        /// <param name="queryData">Quero for the observations.</param>
        /// <returns>Paginated list of the observations matching the query.</returns>
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
            if (queryData.UserId is not null)
            {
                query = query.Where(obs => obs.UserId == queryData.UserId);
            }
            query = AddBboxToQuery(queryData, query);
            query = AddDistanceToQuery(queryData, query);
            var source = query.Include(obs => obs.Tags).Include(obs => obs.User).Select(obs => new ObservationDto
            {
                Id = obs.Id,
                Title = obs.Title,
                UserId = obs.UserId,
                Username = obs.User.UserName,
                Location = obs.Location,
                Boundary = obs.Boundary,
                Tags = obs.Tags.Select(tag => new TagDto() { Id = tag.Id, Name = tag.Name }).ToList(),

            }).OrderBy(obs => obs.Id);
            return await PaginatedList<ObservationDto>.QueryAsync(source, queryData.PageIndex, queryData.PageSize);
        }
        /// <summary>
        /// Creates an observation.
        /// </summary>
        /// <param name="obsDto">The observation to add.</param>
        /// <returns>The newly created observation.</returns>
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
                    UserId = obsDto.UserId,
                }).ToList();
            }
            _context.Observation.Add(obs);
            await _context.SaveChangesAsync();
            return EntityToDto(obs);
        }

        /// <summary>
        /// Updates an observation.
        /// </summary>
        /// <param name="obsDto">The updated observation.</param>
        /// <returns>true if successful.</returns>
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
            //obs.UserId = obsDto.UserId;
            obs.Location = DetermineLocation(obsDto);
            obs.Boundary = obsDto.Boundary;
            obs.Tags = await PrepareTags(obsDto.Tags);
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Deletes an observation.
        /// </summary>
        /// <param name="id">Id of the observation.</param>
        /// <returns>true if successful.</returns>
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

        private Polygon? MakeBbox(ObservationQuery queryData)
        {
            if(queryData.Xmin is not null && queryData.Ymin is not null && queryData.Xmax is not null && queryData.Ymax is not null)
            {
                Coordinate[] bboxCoordinates = new Coordinate[]
                {
                    new Coordinate((double)queryData.Xmin, (double)queryData.Ymin),
                    new Coordinate((double)queryData.Xmax, (double)queryData.Ymin),
                    new Coordinate((double)queryData.Xmax, (double)queryData.Ymax),
                    new Coordinate((double)queryData.Xmin, (double)queryData.Ymax),
                    new Coordinate((double)queryData.Xmin, (double)queryData.Ymin),
                };
                GeometryFactory factory = new GeometryFactory(new PrecisionModel(), 4326);
                return new Polygon(new LinearRing(bboxCoordinates), factory);
            }
            else
            {
                return null;
            }
        }

        private IQueryable<Observation> AddBboxToQuery(ObservationQuery queryData, IQueryable<Observation> query)
        {
           
            Polygon? bbox = MakeBbox(queryData);
            if(bbox == null)
            {
                return query;
            }
            else
            {
                return query.Where(obs => (obs.Boundary != null && obs.Boundary.Intersects(bbox)) || obs.Location.Intersects(bbox));
            }
            
        }

        private IQueryable<Observation> AddDistanceToQuery(ObservationQuery queryData, IQueryable<Observation> query)
        {
            if(queryData.Xcenter is not null && queryData.Ycenter is not null && queryData.Distance is not null)
            {

                Point center = new Point((double)queryData.Xcenter, (double)queryData.Ycenter) { SRID = 4326 };
                double distance = (double)queryData.Distance;
                return query.Where(obs => (obs.Boundary != null && obs.Boundary.Distance(center) < distance) || obs.Location.Distance(center) < distance);
            }
            else
            {
                return query;
            }
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
                Username = obs.User?.UserName,
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
