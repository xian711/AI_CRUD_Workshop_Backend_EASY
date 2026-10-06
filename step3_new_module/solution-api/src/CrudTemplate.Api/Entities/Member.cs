namespace CrudTemplate.Api.Entities;

/// <summary>
/// 資料表 <c>template_member</c> 對應實體（DESIGN §4.1）。
/// </summary>
/// <remarks>
/// PascalCase 屬性由 DbContext 命名轉換映射為 snake_case 欄位（NFR-B-07）。
/// 依 BR-B-05 / D10：實體不含 positionTitle（由前端 positionCode 導出）。
/// 日期欄位用 <see cref="DateOnly"/> ↔ SQL <c>date</c>，無時區概念（D7 / BR-B-08）。
/// </remarks>
public class Member
{
    /// <summary>主鍵，格式 <c>M-###</c>（後端 SEQUENCE 產生，BR-B-07）。</summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>姓名。</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>性別（男 / 女）。</summary>
    public string Gender { get; set; } = string.Empty;

    /// <summary>出生日期。</summary>
    public DateOnly BirthDate { get; set; }

    /// <summary>證件類別（身分證 / 居留證 / 護照）。</summary>
    public string IdType { get; set; } = string.Empty;

    /// <summary>證號（格式依 IdType，BR-B-02）。</summary>
    public string NationalId { get; set; } = string.Empty;

    /// <summary>行動電話（09xxxxxxxx）。</summary>
    public string Phone { get; set; } = string.Empty;

    /// <summary>電子郵件（選填）。</summary>
    public string? Email { get; set; }

    /// <summary>居住縣市。</summary>
    public string ResidenceCounty { get; set; } = string.Empty;

    /// <summary>居住鄉鎮區。</summary>
    public string ResidenceTownship { get; set; } = string.Empty;

    /// <summary>居住地址。</summary>
    public string ResidenceAddress { get; set; } = string.Empty;

    /// <summary>編組。</summary>
    public string GroupName { get; set; } = string.Empty;

    /// <summary>職務代碼（director / deputy / leader / member）。</summary>
    public string PositionCode { get; set; } = string.Empty;

    /// <summary>多值資格（EF primitive collection → PostgreSQL 原生 text[] 陣列欄位，DESIGN §4.3）。</summary>
    public List<string> Qualifications { get; set; } = [];

    /// <summary>狀態（在職 / 停用）。</summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>備註（選填）。</summary>
    public string? Note { get; set; }

    /// <summary>血型（選填，Contract v2；A / B / AB / O 或 null，BR-B-11）。</summary>
    public string? BloodType { get; set; }

    /// <summary>最後更新日期（後端本地時區寫入，BR-B-08）。</summary>
    public DateOnly UpdatedAt { get; set; }
}
