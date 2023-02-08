using krokus_api.Dtos;

namespace krokus_api.Services
{
    /// <summary>
    /// Service for handling confirmations.
    /// </summary>
    public interface IConfirmationService
    {
        /// <summary>
        /// Finds all the confirmations in the database.
        /// </summary>
        /// <returns>List of all the confirmations.</returns>
        public Task<List<ConfirmationDto>> FindAllConfirmations();
        /// <summary>
        /// Finds the confirmations which match the query.
        /// </summary>
        /// <param name="queryData">Query  describing the confirmations.</param>
        /// <returns>Paginated list of confirmations matching the query.</returns>
        public Task<PaginatedList<ConfirmationDto>> FindWithQuery(ConfirmationQuery queryData);
        /// <summary>
        /// Finds a confirmation with the id.
        /// </summary>
        /// <param name="id">Id of the confirmation.</param>
        /// <returns>The confirmation with the given id or null.</returns>
        public Task<ConfirmationDto?> FindById(long id);
        /// <summary>
        /// Creates a confirmation.
        /// </summary>
        /// <param name="confDto">A confirmation to add.</param>
        /// <returns>The newly created confirmation.</returns>
        public Task<ConfirmationDto> CreateConfirmation(ConfirmationDto confDto);
        /// <summary>
        /// Updates a confirmation.
        /// </summary>
        /// <param name="confDto">New version of the confirmation.</param>
        /// <returns>true if successful.</returns>
        public Task<bool> UpdateConfirmation(ConfirmationDto confDto);
        /// <summary>
        /// Deletes a confirmation.
        /// </summary>
        /// <param name="id">Id of the confirmation.</param>
        /// <returns>true if successful.</returns>
        public Task<bool> DeleteConfirmation(long id);

    }
}
