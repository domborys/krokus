using krokus_api.Dtos;

namespace krokus_api.Services
{
    public interface IObservationService
    {
        public Task<List<ObservationDto>> FindAllObservations();
        public Task<PaginatedList<ObservationDto>> FindWithQuery(ObservationQuery queryData);
        public Task<ObservationDto?> FindById(long id);
        public Task<ObservationDto> CreateObservation(ObservationDto obsDto);
        public Task<bool> UpdateObservation(ObservationDto obsDto);
        public Task<bool> DeleteObservation(long id);

    }
}
