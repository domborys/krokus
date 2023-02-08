using Azure;
using krokus_api.Consts;
using krokus_api.Dtos;
using krokus_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;

namespace krokus_api.Controllers
{
    /// <summary>
    /// Controller for handling the pictures added to confirmations.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class PicturesController : ControllerBase
    {
        private readonly IPictureService _pictureService;
        private readonly IConfirmationService _confirmationService;
        private readonly IAuthorizationService _authorizationService;

        public PicturesController(IPictureService pictureService, IConfirmationService confirmationService, IAuthorizationService authorizationService)
        {
            _pictureService = pictureService;
            _confirmationService = confirmationService;
            _authorizationService = authorizationService;
        }

        /// <summary>
        /// Gets the details about a picture.
        /// </summary>
        /// <param name="id">Id of the picture.</param>
        /// <returns>The details of the picture.</returns>
        [HttpGet("{id}/Details")]
        [AllowAnonymous]
        public async Task<ActionResult<PictureDetailsDto>> GetPictureDetails(long id)
        {
            var picture = await _pictureService.GetFileDetails(id);
            if(picture == null)
            {
                return NotFound();
            }
            return Ok(picture);
        }

        /// <summary>
        /// Gets the contents (file) of a picture.
        /// </summary>
        /// <param name="id">Id of the picture.</param>
        /// <returns>The picture.</returns>
        [HttpGet("{id}/Contents")]
        [AllowAnonymous]
        public async Task<ActionResult> GetPictureContents(long id)
        {
            var downloadData = await _pictureService.GetFileDownloadData(id);
            if (downloadData == null)
            {
                return NotFound();
            }
            new FileExtensionContentTypeProvider().TryGetContentType(downloadData.FilePath, out string? contentType);
            return PhysicalFile(downloadData.FilePath, contentType ?? "application/octet-stream");
        }

        /// <summary>
        /// Adds a picture
        /// </summary>
        /// <param name="pictureUploadDto">Picture details and contents.</param>
        /// <returns>List of the details of created pictures.</returns>
        [HttpPost]
        public async Task<ActionResult<List<PictureDetailsDto>>> PostPicture([FromForm] PictureUploadDto pictureUploadDto)
        {
            var confirmation = await _confirmationService.FindById(pictureUploadDto.ConfirmationId);
            if (confirmation == null)
            {
                return BadRequest(Problem(detail: $"Confirmation with id {pictureUploadDto.ConfirmationId} not found."));
            }
            var authResult = await _authorizationService.AuthorizeAsync(User, confirmation, Policies.IsAuthorOrHasModeratorRights);
            if (authResult.Succeeded)
            {
                var createdPictureDetails = await _pictureService.CreatePictures(pictureUploadDto);
                var routeValues = createdPictureDetails.Select(p => new { id = p.Id });
                return Ok(createdPictureDetails);
            }
            else if (User.Identity?.IsAuthenticated ?? false)
            {
                return Forbid();
            }
            else
            {
                return Unauthorized();
            }
            
        }
        /// <summary>
        /// Deletes a picture.
        /// </summary>
        /// <param name="id">Id of the picture.</param>
        /// <returns>No Content on success.</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePicture(long id)
        {
            var picture = await _pictureService.GetFileDetails(id);
            if (picture == null)
            {
                return NotFound();
            }
            var confirmation = await _confirmationService.FindById(picture.ConfirmationId);
            if (confirmation == null)
            {
                return BadRequest(Problem(detail: $"Confirmation with id {picture.ConfirmationId} not found."));
            }
            var authResult = await _authorizationService.AuthorizeAsync(User, confirmation, Policies.IsAuthorOrHasModeratorRights);
            if (authResult.Succeeded)
            {
                await _pictureService.DeleteFile(id);
                return NoContent();
            }
            else if (User.Identity?.IsAuthenticated ?? false)
            {
                return Forbid();
            }
            else
            {
                return Unauthorized();
            }

        }
    }
}
