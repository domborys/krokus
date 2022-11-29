using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using krokus_api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace krokus_api.Data
{
    public class AppDbContext : IdentityDbContext<User>
    {
        public AppDbContext (DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<krokus_api.Models.Observation> Observation { get; set; } = default!;

        public DbSet<Confirmation> Confirmation { get; set; } = default!;
        public DbSet<Tag> Tag { get; set; } = default!;
    }
}
