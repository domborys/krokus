using krokus_api.Dtos;
using Microsoft.AspNetCore.Identity;

namespace krokus_api.Services
{
    /// <summary>
    /// Service for managing users and authentication.
    /// </summary>
    public interface IUserService
    {
        /// <summary>
        /// Adds user account.
        /// </summary>
        /// <param name="request">The user to create.</param>
        /// <returns>The newly created user.</returns>
        /// <exception cref="ArgumentException"></exception>
        public Task<UserDto> Register(RegisterDto request);
        /// <summary>
        /// Tries to log in the user.
        /// </summary>
        /// <param name="request">Login request.</param>
        /// <returns>API access token.</returns>
        /// <exception cref="LoginException">Thrown when the credentials are invalid or user is banned.</exception>
        public Task<string> Login(LoginDto request);
        /// <summary>
        /// Gets the currently logged-in user.
        /// </summary>
        /// <returns>The currently logged-in user.</returns>
        public Task<UserDto> GetCurrentUser();
        /// <summary>
        /// Finds all users.
        /// </summary>
        /// <returns>List of all users.</returns>
        public Task<List<UserDto>> GetAllUsers();
        /// <summary>
        /// Finds user using query.
        /// </summary>
        /// <param name="queryData">the query</param>
        /// <returns>Paginated list of users matching the query.</returns>
        public Task<PaginatedList<UserDto>> FindWithQuery(UserQuery queryData);
        /// <summary>
        /// Finds a user by id.
        /// </summary>
        /// <param name="id">Id of the user.</param>
        /// <returns>The user with the specified id.</returns>
        public Task<UserDto?> FindById(string id);
        /// <summary>
        /// Changes user password.
        /// </summary>
        /// <param name="passwordChangeRequest">Password request change.</param>
        /// <returns>true if successful.</returns>
        public Task<IdentityResult> ChangePassword(PasswordChangeDto passwordChangeRequest);
        /// <summary>
        /// Sets the role of the user.
        /// </summary>
        /// <param name="userId">User id.</param>
        /// <param name="newRole">New role of the user.</param>
        /// <returns></returns>
        public Task SetUserRole(string userId, string newRole);
        /// <summary>
        /// Sets or lifts user ban.
        /// </summary>
        /// <param name="userId">User id.</param>
        /// <param name="banDto">Information about ban.</param>
        /// <returns></returns>
        public Task SetUserBan(string userId, UserBanDto banDto);
        /// <summary>
        /// Koń jaki jest, każdy widzi.
        /// </summary>
        /// <returns></returns>
        /// <exception cref="ArgumentException"></exception>
        public Task CreateAdminIfDoesntExist();
        /// <summary>
        /// Creates roles if they don't exist in the database.
        /// </summary>
        /// <returns></returns>
        public Task CreateRoles();
        /// <summary>
        /// Deletes the user.
        /// </summary>
        /// <param name="id">Id of the user</param>
        /// <returns></returns>
        public Task<bool> DeleteUser(string id);
    }
}
