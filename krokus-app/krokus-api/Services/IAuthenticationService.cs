using krokus_api.Dtos;
using Microsoft.AspNetCore.Identity;

namespace krokus_api.Services
{
    public interface IAuthenticationService
    {
        public Task<string> Register(RegisterDto request);

        public Task<string> Login(LoginDto request);
        public Task<UserDto> GetCurrentUser();
        public Task<List<UserDto>> GetAllUsers();
        public Task<IdentityResult> ChangePassword(PasswordChangeDto passwordChangeRequest);
    }
}
