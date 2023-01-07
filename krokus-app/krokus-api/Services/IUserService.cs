using krokus_api.Dtos;
using Microsoft.AspNetCore.Identity;

namespace krokus_api.Services
{
    public interface IUserService
    {
        public Task<UserDto> Register(RegisterDto request);

        public Task<string> Login(LoginDto request);
        public Task<UserDto> GetCurrentUser();
        public Task<List<UserDto>> GetAllUsers();

        public Task<UserDto?> FindById(string id);
        public Task<IdentityResult> ChangePassword(PasswordChangeDto passwordChangeRequest);
        public Task SetUserRole(string userId, string newRole);
        public Task CreateAdminIfDoesntExist();
        public Task CreateRoles();
        public Task<bool> DeleteUser(string id);
    }
}
