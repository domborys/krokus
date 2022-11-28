using krokus_api.Data;
using krokus_api.Dtos;
using krokus_api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace krokus_api.Services
{
    public class TagService : ITagService
    {
        private readonly AppDbContext _context;

        public TagService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<TagDto>> FindAllTags()
        {
            return await _context.Tag.Select(tag => new TagDto { 
                Id = tag.Id,
                Name = tag.Name,
            }).ToListAsync();
        }

        public async Task<TagDto?> FindById(long id)
        {
            var tag = await _context.Tag.FindAsync(id);
            if(tag == null)
            {
                return null;
            }
            return new TagDto()
            {
                Id = tag.Id,
                Name = tag.Name,
            };
        }

        public async Task<Tag?> FindByName(string name)
        {
            return await _context.Tag.Where(tag => tag.Name == name).FirstOrDefaultAsync();
        }

        public async Task<TagDto> CreateTag(TagDto tagDto)
        {
            Tag tag = new()
            {
                Name = tagDto.Name
            };
            _context.Tag.Add(tag);
            await _context.SaveChangesAsync();
            return new TagDto()
            {
                Id = tag.Id,
                Name = tag.Name,
            };
        }

        public async Task<bool> UpdateTag(TagDto tagDto)
        {
            Tag? tag = await _context.Tag.FindAsync(tagDto.Id);
            if(tag == null)
            {
                return false;
            }
            tag.Name = tagDto.Name;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteTag(long id)
        {
            Tag? tag = await _context.Tag.FindAsync(id);
            if(tag == null)
            {
                return false;
            }
            _context.Tag.Remove(tag);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
