using krokus_api.Dtos;

namespace krokus_api.Services
{
    public interface IAuthenticationService
    {
        public Task<string> Register(RegisterRequest request);

        public Task<string> Login(LoginRequest request);
        public Task<UserResponse> GetCurrentUser();
        public Task<List<UserResponse>> GetAllUsers();
    }
}
