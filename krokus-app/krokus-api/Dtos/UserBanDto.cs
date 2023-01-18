namespace krokus_api.Dtos
{
    public class UserBanDto
    {
        public bool PermanentlyBanned { get; set; } = false;
        public DateTime? BannedUntil { get; set; }
    }
}
