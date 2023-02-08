using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace krokus_api.Controllers
{
    /// <summary>
    /// Controller for handling arrors.
    /// </summary>
    [Route("api")]
    [ApiController]
    public class ErrorController : ControllerBase
    {
        [AllowAnonymous]
        [ApiExplorerSettings(IgnoreApi = true)]
        [Route("ErrorDevelopment")]
        public IActionResult HandleErrorDevelopment([FromServices] IHostEnvironment hostEnvironment)
        {
            if (!hostEnvironment.IsDevelopment())
            {
                return NotFound();
            }

            var exceptionHandlerFeature =
                HttpContext.Features.Get<IExceptionHandlerFeature>()!;

            return Problem(
                detail: exceptionHandlerFeature.Error.StackTrace,
                title: exceptionHandlerFeature.Error.Message);
        }

        [AllowAnonymous]
        [ApiExplorerSettings(IgnoreApi = true)]
        [Route("Error")]
        public IActionResult HandleError() =>
            Problem();
    }
}
