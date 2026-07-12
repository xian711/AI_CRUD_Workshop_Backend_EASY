namespace CrudTemplate.Api.Models;

/// <summary>
/// 裝備物資回應 DTO（camelCase，對齊前端 EquipmentItem 型別 + id/code/updatedAt，SDD-delta §3）。
/// </summary>
/// <remarks>
/// 契約 14 欄。序列化採 ASP.NET 預設 camelCase；日期為 <see cref="DateOnly"/>，序列化即 yyyy-MM-dd。
/// 選填欄位（keeper / keeperPhone / locationName / purchaseDate / specNote）舊資料為 null，永遠回傳此鍵
/// （前端 adapter 將 null 正規化為空字串顯示）。
/// </remarks>
public class EquipmentItemResult
{
    public string Id { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string CategoryKey { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Qty { get; set; }
    public string Unit { get; set; } = string.Empty;
    public string Spec1 { get; set; } = string.Empty;
    public string? Keeper { get; set; }
    public string? KeeperPhone { get; set; }
    public string? LocationName { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateOnly? PurchaseDate { get; set; }
    public string? SpecNote { get; set; }
    public DateOnly UpdatedAt { get; set; }
}
