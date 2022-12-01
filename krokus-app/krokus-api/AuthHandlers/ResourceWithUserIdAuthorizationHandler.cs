using krokus_api.Dtos;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace krokus_api.AuthHandlers
{
    public class ResourceWithUserIdAuthorizationHandler : AuthorizationHandler<SameUserRequirement, IResourceWithUserId>
    {
        protected override Task HandleRequirementAsync(
            AuthorizationHandlerContext context, SameUserRequirement requirement, IResourceWithUserId resource)
        {
            var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId != null && userId == resource.UserId)
            {
                context.Succeed(requirement);
            }
            else if (requirement.AlwaysAllowedRoles.Any(role => context.User.IsInRole(role)))
            {
                context.Succeed(requirement);
            }
            return Task.CompletedTask;
        }
    }

    public class SameUserRequirement : IAuthorizationRequirement {
        public List<string> AlwaysAllowedRoles { get; set; } = new List<string>();
    }
}
