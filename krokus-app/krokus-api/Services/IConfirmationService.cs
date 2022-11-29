using krokus_api.Dtos;

namespace krokus_api.Services
{
    public interface IConfirmationService
    {
        public Task<List<ConfirmationDto>> FindAllConfirmations();
        public Task<PaginatedList<ConfirmationDto>> FindWithQuery(ConfirmationQuery queryData);
        public Task<ConfirmationDto?> FindById(long id);
        public Task<ConfirmationDto> CreateConfirmation(ConfirmationDto confDto);
        public Task<bool> UpdateConfirmation(ConfirmationDto confDto);
        public Task<bool> DeleteConfirmation(long id);

    }
}
