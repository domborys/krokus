using krokus_api.Dtos;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace krokus_api.AuthHandlers
{
    /// <summary>
    /// Authorization handler for resources which may only be accessed by an author or a moderator.
    /// </summary>
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
    /// <summary>
    /// A reguirement that current user must be the same as the author of the resource
    /// or have one listed roles. 
    /// </summary>
    public class SameUserRequirement : IAuthorizationRequirement {
        /// <summary>
        /// Roles which allow the user to access resources of other authors.
        /// </summary>
        public List<string> AlwaysAllowedRoles { get; set; } = new List<string>();
    }
}
