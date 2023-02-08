namespace krokus_api.Consts
{
    /// <summary>
    /// Policy names.
    /// </summary>
    public class Policies
    {
        public const string HasUserRights = "IsUser";
        public const string HasModeratorRights = "IsModerator";
        public const string HasAdminRights = "IsAdmin";
        public const string IsAuthorOrHasModeratorRights = "IsAuthorOrHasModeratorRights";
    }
}
