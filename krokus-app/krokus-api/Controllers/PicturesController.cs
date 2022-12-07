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
