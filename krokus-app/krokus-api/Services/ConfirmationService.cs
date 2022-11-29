using krokus_api.Data;
using krokus_api.Dtos;
using krokus_api.Models;
using Microsoft.EntityFrameworkCore;

namespace krokus_api.Services
{
    public class ConfirmationService : IConfirmationService
    {
        private readonly AppDbContext _context;

        public ConfirmationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ConfirmationDto>> FindAllConfirmations()
        {
            return await _context.Confirmation.Select(conf => EntityToDto(conf)).ToListAsync();
        }

        public async Task<PaginatedList<ConfirmationDto>> FindWithQuery(ConfirmationQuery queryData)
        {
            IQueryable<Confirmation> query = _context.Confirmation;
            if (queryData.ObservationId is not null)
            {
                query = query.Where(conf => conf.ObservationId == queryData.ObservationId);
            }
            if (queryData.UserId is not null)
            {
                query = query.Where(conf => conf.UserId == queryData.UserId);
            }
            var source = query.OrderBy(conf => conf.Id).Select(conf => EntityToDto(conf));
            return await PaginatedList<ConfirmationDto>.QueryAsync(source, queryData.PageIndex, queryData.PageSize);
        }

        public async Task<ConfirmationDto?> FindById(long id)
        {
            var conf = await _context.Confirmation.FindAsync(id);
            if (conf == null)
            {
                return null;
            }
            return EntityToDto(conf);
        }

        public async Task<ConfirmationDto> CreateConfirmation(ConfirmationDto confDto)
        {
            Confirmation conf = new Confirmation
            {
                IsConfirmed = confDto.IsConfirmed,
                DateTime = confDto.DateTime,
                Description = confDto.Description,
                UserId = confDto.UserId,
                ObservationId = confDto.ObservationId,
            };
            _context.Confirmation.Add(conf);
            await _context.SaveChangesAsync();
            return EntityToDto(conf);
        }

        public async Task<bool> UpdateConfirmation(ConfirmationDto confDto)
        {
            Confirmation? confirmation = await _context.Confirmation.FindAsync(confDto.Id);
            if (confirmation == null)
            {
                return false;
            }
            confirmation.IsConfirmed = confDto.IsConfirmed;
            confirmation.DateTime = confDto.DateTime;
            confirmation.Description = confDto.Description;
            confirmation.UserId = confDto.UserId;
            confirmation.ObservationId = confDto.ObservationId;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteConfirmation(long id)
        {
            var confirmation = await _context.Confirmation.FindAsync(id);
            if (confirmation == null)
            {
                return false;
            }
            _context.Confirmation.Remove(confirmation);
            await _context.SaveChangesAsync();
            return true;
        }

        private static ConfirmationDto EntityToDto(Confirmation conf)
        {
            return new ConfirmationDto
            {
                Id = conf.Id,
                IsConfirmed = conf.IsConfirmed,
                DateTime = conf.DateTime,
                Description = conf.Description,
                UserId = conf.UserId,
                ObservationId = conf.ObservationId
            };
        }
    }
}
