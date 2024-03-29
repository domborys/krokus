﻿namespace krokus_api.Dtos
{
    public class UserDto
    {
        public string? Id { get; set; }
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? Role { get; set; }
        public DateTime? BannedUntil { get; set; }
        public bool PermanentlyBanned { get; set; } = false;
    }
}
