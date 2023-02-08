namespace krokus_api.Consts
{
    /// <summary>
    /// Role names.
    /// </summary>
    public class Roles
    {
        public const string User = "User";
        public const string Moderator = "Moderator";
        public const string Admin = "Admin";

        public static readonly List<string> All = new() { User, Moderator, Admin };
    }
}
