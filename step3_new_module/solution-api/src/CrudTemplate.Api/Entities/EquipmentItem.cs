namespace CrudTemplate.Api.Entities;

/// <summary>
/// 資料表 <c>equipment_item</c> 對應實體（中心裝備物資，SRS-delta §2）。
/// </summary>
/// <remarks>
/// PascalCase 屬性由 DbContext 命名轉換映射為 snake_case 欄位（沿用範本 NFR-B-07）。
/// <para>
/// 主鍵 <see cref="Id"/> 格式 <c>E-###</c>（後端 SEQUENCE 產生，沿用範本 D6）；
/// <see cref="Code"/> 品項編碼 <c>{類別碼}-{項目碼}-{流水}</c> 由服務層依「同前綴 MAX+1」產生，
/// 具名唯一索引 <c>ux_equipment_item_code</c>（SCOPE Q1，偏離範本 D6 單一 SEQUENCE 的教學點）。
/// </para>
/// <para>選填欄位（keeper / keeperPhone / locationName / purchaseDate / specNote）以 nullable 型別承載；
/// 空字串 / 純空白於 DTO 正規化為 null（DESIGN-delta §5，仿範本 BloodType）。</para>
/// <para>日期欄位用 <see cref="DateOnly"/> ↔ SQL <c>date</c>，無時區概念（沿用範本 D7）。</para>
/// </remarks>
public class EquipmentItem
{
    /// <summary>主鍵，格式 <c>E-###</c>（後端 SEQUENCE 產生）。</summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>品項編碼 <c>{類別碼}-{項目碼}-{流水3碼}</c>（後端產生，唯一）。</summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>分類 value（見 <see cref="Constants.EquipmentEnums.CategoryKeys"/>）。</summary>
    public string CategoryKey { get; set; } = string.Empty;

    /// <summary>項目名（一般分類選單值；「其他」分類自填）。</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>數量（非負整數）。</summary>
    public int Qty { get; set; }

    /// <summary>單位（台 / 件 / 箱…）。</summary>
    public string Unit { get; set; } = string.Empty;

    /// <summary>規格說明。</summary>
    public string Spec1 { get; set; } = string.Empty;

    /// <summary>保管人（選填）。</summary>
    public string? Keeper { get; set; }

    /// <summary>保管人電話（選填）。</summary>
    public string? KeeperPhone { get; set; }

    /// <summary>存放地點（選填，單一文字欄）。</summary>
    public string? LocationName { get; set; }

    /// <summary>狀態（normal / maintenance / scrapped）。</summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>採購日期（選填，可 null）。</summary>
    public DateOnly? PurchaseDate { get; set; }

    /// <summary>備註（選填）。</summary>
    public string? SpecNote { get; set; }

    /// <summary>最後更新日期（後端本地時區寫入，沿用範本 D12）。</summary>
    public DateOnly UpdatedAt { get; set; }
}
