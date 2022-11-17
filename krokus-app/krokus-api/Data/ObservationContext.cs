﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using krokus_api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace krokus_api.Data
{
    public class ObservationContext : IdentityDbContext<User>
    {
        public ObservationContext (DbContextOptions<ObservationContext> options)
            : base(options)
        {
        }

        public DbSet<krokus_api.Models.Observation> Observation { get; set; } = default!;
    }
}
