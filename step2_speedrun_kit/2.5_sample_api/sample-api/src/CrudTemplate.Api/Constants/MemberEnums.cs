namespace CrudTemplate.Api.Constants;

/// <summary>
/// 人員枚舉字面值與職務中繼資料（對齊前端 useTemplateMembers.ts 常數）。
/// </summary>
/// <remarks>
/// 集中允許值於單一來源：DTO 的 <c>[AllowedValues]</c> 與 DB CHECK constraint 共用此處字面值，
/// 避免兩邊漂移（SDD §5）。
/// </remarks>
public static class MemberEnums
{
    // ── 性別（BR-B-09，對齊前端 TEMPLATE_GENDER_OPTIONS）─────────────
    public const string GenderMale = "男";
    public const string GenderFemale = "女";
    public static readonly string[] Genders = [GenderMale, GenderFemale];

    // ── 證件類別（BR-T-02，對齊前端 TEMPLATE_ID_TYPE_OPTIONS）────────
    public const string IdTypeNationalId = "身分證";
    public const string IdTypeResidence = "居留證";
    public const string IdTypePassport = "護照";
    public static readonly string[] IdTypes = [IdTypeNationalId, IdTypeResidence, IdTypePassport];

    // ── 狀態（BR-B-09，對齊前端 TEMPLATE_MEMBER_STATUS_OPTIONS）──────
    public const string StatusActive = "在職";
    public const string StatusInactive = "停用";
    public static readonly string[] Statuses = [StatusActive, StatusInactive];

    // ── 職務代碼（對齊前端 TemplatePositionCode）─────────────────────
    public const string PositionDirector = "director";
    public const string PositionDeputy = "deputy";
    public const string PositionLeader = "leader";
    public const string PositionMember = "member";
    public static readonly string[] PositionCodes =
        [PositionDirector, PositionDeputy, PositionLeader, PositionMember];

    // ── 血型（Contract v2，選填；欄位源自前端課 Lab，跨課契約對齊，BR-B-11）─────
    public const string BloodTypeA = "A";
    public const string BloodTypeB = "B";
    public const string BloodTypeAb = "AB";
    public const string BloodTypeO = "O";
    public static readonly string[] BloodTypes = [BloodTypeA, BloodTypeB, BloodTypeAb, BloodTypeO];
}
