using System.ComponentModel.DataAnnotations;
using CrudTemplate.Api.Constants;

namespace CrudTemplate.Api.Models;

/// <summary>
/// 新增 / 更新人員的請求 DTO（SDD §5）。
/// </summary>
/// <remarks>
/// BR-B-06：本 DTO 刻意「不宣告」id / updatedAt——body 帶了也被繫結忽略，杜絕外部竄改。
/// 驗證分工（SDD §5 實作規定）：
///   - 單欄位允許值一律用內建 <c>[AllowedValues]</c>（gender/idType/positionCode/status）。
///   - <see cref="Validate"/> 放物件層級/條件規則：① nationalId 依 idType 相依驗證；② email 非空才驗格式；
///     ③ qualifications 規則（BR-B-10）；④ bloodType 非 null 時須 ∈ {A,B,AB,O}（BR-B-11，Contract v2）。
/// 注意框架行為：物件層級 <see cref="Validate"/> 僅在所有屬性層級 DataAnnotations 通過後才執行。
/// </remarks>
public class MemberRequest : IValidatableObject
{
    /// <summary>身分證證號格式（BR-B-02）。</summary>
    private const string NationalIdPattern = @"^[A-Z][12]\d{8}$";

    [Required(ErrorMessage = "姓名為必填")]
    [StringLength(50, ErrorMessage = "姓名長度不可超過 50 字")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "性別為必填")]
    [AllowedValues(MemberEnums.GenderMale, MemberEnums.GenderFemale,
        ErrorMessage = "性別只能是「男」或「女」")]
    public string Gender { get; set; } = string.Empty;

    // 注意：value type（DateOnly）的 [Required] 對「省略欄位」無效——JSON 未帶欄位時模型繫結
    // 會默默填入 default(DateOnly)（0001-01-01）而非觸發驗證失敗，形成必填漏洞。
    // 改用 DateOnly? 讓「省略」繫結為 null，[Required] 才能真正攔下（SDD §5 H1 裁決）。
    [Required(ErrorMessage = "出生日期為必填")]
    public DateOnly? BirthDate { get; set; }

    [Required(ErrorMessage = "證件類別為必填")]
    [AllowedValues(MemberEnums.IdTypeNationalId, MemberEnums.IdTypeResidence, MemberEnums.IdTypePassport,
        ErrorMessage = "證件類別只能是「身分證」「居留證」或「護照」")]
    public string IdType { get; set; } = string.Empty;

    [Required(ErrorMessage = "證號為必填")]
    [StringLength(20, ErrorMessage = "證號長度不可超過 20 字")]
    public string NationalId { get; set; } = string.Empty;

    [Required(ErrorMessage = "行動電話為必填")]
    [RegularExpression(@"^09\d{8}$", ErrorMessage = "行動電話格式須為 09 開頭共 10 碼")]
    public string Phone { get; set; } = string.Empty;

    // email 選填；非空才驗格式（於 Validate 判空後驗，避免空字串被 [EmailAddress] 誤判為錯誤）
    [StringLength(100, ErrorMessage = "電子郵件長度不可超過 100 字")]
    public string? Email { get; set; }

    [Required(ErrorMessage = "居住縣市為必填")]
    [StringLength(10, ErrorMessage = "居住縣市長度不可超過 10 字")]
    public string ResidenceCounty { get; set; } = string.Empty;

    [Required(ErrorMessage = "居住鄉鎮區為必填")]
    [StringLength(10, ErrorMessage = "居住鄉鎮區長度不可超過 10 字")]
    public string ResidenceTownship { get; set; } = string.Empty;

    [Required(ErrorMessage = "居住地址為必填")]
    [StringLength(100, ErrorMessage = "居住地址長度不可超過 100 字")]
    public string ResidenceAddress { get; set; } = string.Empty;

    [Required(ErrorMessage = "編組為必填")]
    [StringLength(20, ErrorMessage = "編組長度不可超過 20 字")]
    public string GroupName { get; set; } = string.Empty;

    [Required(ErrorMessage = "職務代碼為必填")]
    [AllowedValues(MemberEnums.PositionDirector, MemberEnums.PositionDeputy,
        MemberEnums.PositionLeader, MemberEnums.PositionMember,
        ErrorMessage = "職務代碼只能是 director / deputy / leader / member")]
    public string PositionCode { get; set; } = string.Empty;

    private List<string> _qualifications = [];

    /// <summary>多值資格（選填）。省略或 JSON null 一律正規化為空陣列（BR-B-10）。</summary>
    public List<string> Qualifications
    {
        get => _qualifications;
        set => _qualifications = value ?? [];
    }

    [Required(ErrorMessage = "狀態為必填")]
    [AllowedValues(MemberEnums.StatusActive, MemberEnums.StatusInactive,
        ErrorMessage = "狀態只能是「在職」或「停用」")]
    public string Status { get; set; } = string.Empty;

    [StringLength(500, ErrorMessage = "備註長度不可超過 500 字")]
    public string? Note { get; set; }

    private string? _bloodType;

    /// <summary>
    /// 血型（選填，Contract v2）。空字串 / 純空白正規化為 null（仿 Qualifications setter 自包含風格）；
    /// 非 null 時的允許值檢查於 <see cref="Validate"/>（仿 email 選填模式，BR-B-11）。
    /// </summary>
    public string? BloodType
    {
        get => _bloodType;
        set => _bloodType = string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    /// <summary>跨欄位 / 條件驗證（SDD §5：僅兩條）。</summary>
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        // ① BR-B-02：nationalId 依 idType 相依驗證
        //    身分證比對 ^[A-Z][12]\d{8}$；居留證/護照僅需非空 + 長度（已由 Required/StringLength 覆蓋）
        if (IdType == MemberEnums.IdTypeNationalId
            && !System.Text.RegularExpressions.Regex.IsMatch(NationalId, NationalIdPattern))
        {
            yield return new ValidationResult(
                "身分證字號格式錯誤（範例 A123456789）",
                [nameof(NationalId)]);
        }

        // ② BR-B-01：email 非空時才驗格式（空字串視為未填，合法）
        if (!string.IsNullOrEmpty(Email) && !new EmailAddressAttribute().IsValid(Email))
        {
            yield return new ValidationResult(
                "電子郵件格式錯誤",
                [nameof(Email)]);
        }

        // ③ BR-B-10：qualifications 每項 trim 後非空白且 ≤30 字，最多 10 項（null 已於 setter 正規化為空陣列）
        if (Qualifications.Count > 10)
        {
            yield return new ValidationResult(
                "資格最多 10 項",
                [nameof(Qualifications)]);
        }

        if (Qualifications.Any(q => string.IsNullOrWhiteSpace(q) || q.Trim().Length > 30))
        {
            yield return new ValidationResult(
                "每項資格不可為空白且長度不可超過 30 字",
                [nameof(Qualifications)]);
        }

        // ④ BR-B-11：bloodType 選填；非 null 時必須 ∈ {A, B, AB, O}（setter 已將空白正規化為 null）。
        //    回應 JSON key 為 camelCase「bloodType」（仿 phone 檢查，SDD §3.4）。
        if (BloodType is not null && !MemberEnums.BloodTypes.Contains(BloodType))
        {
            yield return new ValidationResult(
                "血型只能是 A、B、AB 或 O",
                [nameof(BloodType)]);
        }
    }
}
