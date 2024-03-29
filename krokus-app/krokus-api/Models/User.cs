﻿using Microsoft.AspNetCore.Identity;

namespace krokus_api.Models
{
    public class User : IdentityUser
    {
        public bool PermanentlyBanned { get; set; } = false;
        public DateTime? BannedUntil { get; set; }
    }
}
