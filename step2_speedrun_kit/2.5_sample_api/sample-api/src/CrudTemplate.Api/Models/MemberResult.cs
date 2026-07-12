namespace CrudTemplate.Api.Models;

/// <summary>
/// 人員回應 DTO（camelCase，對齊前端 TemplateMember 型別，SDD §3）。
/// </summary>
/// <remarks>
/// 依 BR-B-05 / D10：無 positionTitle 欄位（由前端 positionCode 導出）。
/// 序列化採 ASP.NET 預設 camelCase（D1）。日期為 <see cref="DateOnly"/>，序列化即 yyyy-MM-dd。
/// </remarks>
public class MemberResult
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public DateOnly BirthDate { get; set; }
    public string IdType { get; set; } = string.Empty;
    public string NationalId { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string ResidenceCounty { get; set; } = string.Empty;
    public string ResidenceTownship { get; set; } = string.Empty;
    public string ResidenceAddress { get; set; } = string.Empty;
    public string GroupName { get; set; } = string.Empty;
    public string PositionCode { get; set; } = string.Empty;
    public List<string> Qualifications { get; set; } = [];
    public string Status { get; set; } = string.Empty;
    public string? Note { get; set; }

    /// <summary>血型（選填，Contract v2）；舊資料為 null，永遠回傳此鍵。</summary>
    public string? BloodType { get; set; }

    public DateOnly UpdatedAt { get; set; }
}
