using Azure.Core;
using krokus_api.Consts;
using krokus_api.Data;
using krokus_api.Dtos;
using krokus_api.Models;
using krokusapi.Migrations;
using Microsoft.AspNetCore.Identity;
using Microsoft.CodeAnalysis.VisualBasic.Syntax;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NuGet.Protocol.Plugins;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace krokus_api.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<User> _userManager;
        private readonly IConfiguration _configuration;
        private IHttpContextAccessor _httpContextAccessor;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly AppDbContext _context;

        public UserService(UserManager<User> userManager, IConfiguration configuration, IHttpContextAccessor httpContextAccessor, RoleManager<IdentityRole> roleManager, AppDbContext context)
        {
            _userManager = userManager;
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
            _roleManager = roleManager;
            _context = context;
        }

        public async Task<UserDto> Register(RegisterDto request)
        {
            var userByEmail = await _userManager.FindByEmailAsync(request.Email);
            var userByUsername = await _userManager.FindByNameAsync(request.Username);
            if (userByEmail is not null || userByUsername is not null)
            {
                throw new ArgumentException($"User with email {request.Email} or username {request.Username} already exists.");
            }

            User user = new()
            {
                Email = request.Email,
                UserName = request.Username,
                SecurityStamp = Guid.NewGuid().ToString()
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                throw new ArgumentException($"Unable to register user {request.Username}. Errors: {GetErrorsText(result.Errors)}");
            }
            var roleResult = await _userManager.AddToRoleAsync(user, Roles.User);
            if (!roleResult.Succeeded)
            {
                throw new ArgumentException($"Unable to add user {request.Username} to role User. Errors: {GetErrorsText(result.Errors)}");
            }

            var savedUser = await _userManager.FindByNameAsync(request.Username);
            var savedRoles = await _userManager.GetRolesAsync(savedUser);

            //return await Login(new LoginDto { Username = request.Email, Password = request.Password });
            return EntityToDto(savedUser, savedRoles);
        }

        public async Task<string> Login(LoginDto request)
        {
            var user = await _userManager.FindByNameAsync(request.Username);

            if (user is null)
            {
                user = await _userManager.FindByEmailAsync(request.Username);
            }

            if (user is null || !await _userManager.CheckPasswordAsync(user, request.Password))
            {
                throw new ArgumentException($"Unable to authenticate user {request.Username}");
            }

            var authClaims = new List<Claim>
            {
                new(ClaimTypes.Name, user.UserName),
                new(ClaimTypes.Email, user.Email),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new(ClaimTypes.NameIdentifier, user.Id)
            };

            var roles = await _userManager.GetRolesAsync(user);

            authClaims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var token = GetToken(authClaims);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<UserDto> GetCurrentUser()
        {
            var user = _httpContextAccessor.HttpContext?.User;
            var dbuser = await _userManager.GetUserAsync(user);
            var roles = await _userManager.GetRolesAsync(dbuser);
            return new UserDto()
            {
                Id = dbuser.Id,
                Username = dbuser.UserName,
                Email = dbuser.Email,
                Role = roles.FirstOrDefault(),
            };
        }

        public async Task<UserDto?> FindById(string id)
        {
            var dbuser = await _userManager.Users.Where(u => u.Id == id).FirstOrDefaultAsync();
            if(dbuser == null)
            {
                return null;
            }
            var roles = await _userManager.GetRolesAsync(dbuser);
            return EntityToDto(dbuser, roles);
        }

        public async Task<List<UserDto>> GetAllUsers()
        {
            return await _context.Users.Select(u => new
            {
                Id = u.Id,
                Username = u.UserName,
                Email = u.Email,
                Roles = (from ur in _context.UserRoles
                        join r in _context.Roles on ur.RoleId equals r.Id
                        where ur.UserId == u.Id
                        select r.Name).ToList()

            }).Select(u => new UserDto { 
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                Role = u.Roles.FirstOrDefault()
            }).ToListAsync();
            
        }

        public async Task<PaginatedList<UserDto>> FindWithQuery(UserQuery queryData)
        {
            var query = _context.Users.Select(u => new
            {
                Id = u.Id,
                Username = u.UserName,
                Email = u.Email,
                Roles = (from ur in _context.UserRoles
                         join r in _context.Roles on ur.RoleId equals r.Id
                         where ur.UserId == u.Id
                         select r.Name).ToList()

            });
            if (queryData.Username is not null)
            {
                query = query.Where(user => user.Username.Contains(queryData.Username));
            }
            var source = query.Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                Role = u.Roles.FirstOrDefault()
            });
            return await PaginatedList<UserDto>.QueryAsync(source, queryData.PageIndex, queryData.PageSize);
        }

        public async Task<IdentityResult> ChangePassword(PasswordChangeDto passwordChangeRequest)
        {
            var user = _httpContextAccessor.HttpContext?.User;
            var dbuser = await _userManager.GetUserAsync(user);
            var result = await _userManager.ChangePasswordAsync(dbuser, passwordChangeRequest.CurrentPassword, passwordChangeRequest.NewPassword);
            return result;
        }

        public async Task SetUserRole(string userId, string newRole)
        {
            ValidateRole(newRole);
            var user = await _userManager.FindByIdAsync(userId);
            var newRoleList = new List<string>() { newRole };
            var roles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, roles.Except(newRoleList));
            await _userManager.AddToRoleAsync(user, newRole);
        }

        public async Task CreateAdminIfDoesntExist()
        {
            string? username = _configuration["DefaultAdmin:Username"];
            string? email = _configuration["DefaultAdmin:Email"];
            if (username == null)
            {
                return;
            }
            var userByUsername = await _userManager.FindByNameAsync(username);
            if (userByUsername != null)
            {
                return;
            } 
            User user = new()
            {
                UserName = username,
                Email = email,
                SecurityStamp = Guid.NewGuid().ToString()
            };

            string? password = _configuration["DefaultAdmin:Password"];
            var result = await _userManager.CreateAsync(user, password);
            await _userManager.AddToRoleAsync(user, Roles.Admin);

            if (!result.Succeeded)
            {
                throw new ArgumentException($"Unable to create default admin.");
            }

        }

        public async Task CreateRoles()
        {
            var existingRoles = await _roleManager.Roles.Select(role => role.Name).ToListAsync();
            var missingRoles = Roles.All.Except(existingRoles);
            foreach(var role in missingRoles)
            {
                await _roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        public async Task<bool> DeleteUser(string id)
        {
            var user = await _userManager.Users.Where(u => u.Id == id).FirstOrDefaultAsync();
            if (user == null)
            {
                return false;
            }
            await _userManager.DeleteAsync(user);
            return true;
        }

        private JwtSecurityToken GetToken(IEnumerable<Claim> authClaims)
        {
            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                expires: DateTime.Now.AddHours(6),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256));

            return token;
        }

        private string GetErrorsText(IEnumerable<IdentityError> errors)
        {
            return string.Join(", ", errors.Select(error => error.Description).ToArray());
        }

        private void ValidateRole(string role)
        {
            bool isValid = Roles.All.Contains(role);
            if (!isValid)
            {
                throw new ArgumentException($"Invalid role: {role}.");
            }
        }

        private UserDto EntityToDto(User dbuser, IEnumerable<string> roles)
        {
            return new UserDto()
            {
                Id = dbuser.Id,
                Username = dbuser.UserName,
                Email = dbuser.Email,
                Role = roles.FirstOrDefault(),
            };
        }
    }
}
