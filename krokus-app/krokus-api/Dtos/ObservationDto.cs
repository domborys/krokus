﻿using krokus_api.Models;

namespace krokus_api.Dtos
{
    public class ObservationDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = default!;
        public string? UserId { get; set; }
        public List<double> Location { get; set; } = default!;
        public List<TagDto>? Tags { get; set; }
        public List<ConfirmationDto>? Confirmations { get; set; }
    }
}
