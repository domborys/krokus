using krokus_api.Dtos;

namespace krokus_api.Services
{
    /// <summary>
    /// Service managing observations.
    /// </summary>
    public interface IObservationService
    {
        /// <summary>
        /// Finds all observations.
        /// </summary>
        /// <returns>The list of all observations.</returns>
        public Task<List<ObservationDto>> FindAllObservations();
        /// <summary>
        /// Finds observations according to a query.
        /// </summary>
        /// <param name="queryData">Quero for the observations.</param>
        /// <returns>Paginated list of the observations matching the query.</returns>
        public Task<PaginatedList<ObservationDto>> FindWithQuery(ObservationQuery queryData);
        /// <summary>
        /// Finds an observation by id.
        /// </summary>
        /// <param name="id">Id of the observation.</param>
        /// <returns>The observation with the provided id.</returns>
        public Task<ObservationDto?> FindById(long id);
        /// <summary>
        /// Creates an observation.
        /// </summary>
        /// <param name="obsDto">The observation to add.</param>
        /// <returns>The newly created observation.</returns>
        public Task<ObservationDto> CreateObservation(ObservationDto obsDto);
        /// <summary>
        /// Updates an observation.
        /// </summary>
        /// <param name="obsDto">The updated observation.</param>
        /// <returns>true if successful.</returns>
        public Task<bool> UpdateObservation(ObservationDto obsDto);
        /// <summary>
        /// Deletes an observation.
        /// </summary>
        /// <param name="id">Id of the observation.</param>
        /// <returns>true if successful.</returns>
        public Task<bool> DeleteObservation(long id);

    }
}
