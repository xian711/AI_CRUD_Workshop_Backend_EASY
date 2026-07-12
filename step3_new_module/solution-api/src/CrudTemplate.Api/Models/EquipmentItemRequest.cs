using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using CrudTemplate.Api.Constants;

namespace CrudTemplate.Api.Models;

/// <summary>
/// 新增 / 更新裝備物資的請求 DTO（SDD-delta §5）。
/// </summary>
/// <remarks>
/// 逐欄對齊前端 <c>pages/equipment/crud/[id].vue</c> 的驗證規則：
/// <list type="bullet">
///   <item>必填：categoryKey / name / qty / unit / spec1 / status。</item>
///   <item>選填：keeper / keeperPhone / locationName / purchaseDate / specNote（空白正規化為 null）。</item>
///   <item>qty 為整數且不可小於 0（前端 <c>form.qty &lt; 0</c> → 「數量不可小於 0」）。</item>
///   <item>keeperPhone 非空才驗格式（前端 KEEPER_PHONE_PATTERN）。</item>
///   <item>purchaseDate 非 null 且不可晚於今天（前端 <c>form.purchaseDate &gt; today</c>）。</item>
/// </list>
/// 本 DTO 刻意不宣告 id / code / updatedAt——皆由後端產生，body 帶了也被繫結忽略（仿範本 BR-B-06）。
/// 錯誤鍵一律 camelCase（Program.cs 的 InvalidModelStateResponseFactory 統一轉換）。
/// </remarks>
public class EquipmentItemRequest : IValidatableObject
{
    /// <summary>保管人電話格式：手機 09xxxxxxxx 或市話 0X-XXXXXXXX（逐字對齊前端 KEEPER_PHONE_PATTERN）。</summary>
    private const string KeeperPhonePattern = @"^(09\d{8}|0\d{1,2}-?\d{6,8})$";

    [Required(ErrorMessage = "請選擇分類")]
    [AllowedValues(
        EquipmentEnums.CategoryIct, EquipmentEnums.CategoryPower, EquipmentEnums.CategoryStorage,
        EquipmentEnums.CategoryOffice, EquipmentEnums.CategoryPpe, EquipmentEnums.CategoryShelterSupply,
        EquipmentEnums.CategoryEmfood, EquipmentEnums.CategoryMedical, EquipmentEnums.CategoryDecon,
        EquipmentEnums.CategoryOther,
        ErrorMessage = "分類不在允許清單中")]
    public string CategoryKey { get; set; } = string.Empty;

    [Required(ErrorMessage = "請選擇或輸入項目")]
    [StringLength(50, ErrorMessage = "項目長度不可超過 50 字")]
    public string Name { get; set; } = string.Empty;

    // qty 為 value type：省略欄位會默默繫結為 0（範本 H1 裁決同源坑）。
    // 改用 int? 讓「省略」繫結為 null，[Required] 才能真正攔下「請輸入數量」；
    // [Range] 承載前端「數量不可小於 0」。
    [Required(ErrorMessage = "請輸入數量")]
    [Range(0, int.MaxValue, ErrorMessage = "數量不可小於 0")]
    public int? Qty { get; set; }

    [Required(ErrorMessage = "請輸入單位")]
    [StringLength(10, ErrorMessage = "單位長度不可超過 10 字")]
    public string Unit { get; set; } = string.Empty;

    [Required(ErrorMessage = "請輸入規格說明")]
    [StringLength(200, ErrorMessage = "規格說明長度不可超過 200 字")]
    public string Spec1 { get; set; } = string.Empty;

    private string? _keeper;

    /// <summary>保管人（選填）。空白正規化為 null。</summary>
    [StringLength(50, ErrorMessage = "保管人長度不可超過 50 字")]
    public string? Keeper
    {
        get => _keeper;
        set => _keeper = string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private string? _keeperPhone;

    /// <summary>保管人電話（選填）。空白正規化為 null；非 null 時於 <see cref="Validate"/> 驗格式。</summary>
    public string? KeeperPhone
    {
        get => _keeperPhone;
        set => _keeperPhone = string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private string? _locationName;

    /// <summary>存放地點（選填）。空白正規化為 null。</summary>
    [StringLength(100, ErrorMessage = "存放地點長度不可超過 100 字")]
    public string? LocationName
    {
        get => _locationName;
        set => _locationName = string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    [Required(ErrorMessage = "請選擇狀態")]
    [AllowedValues(
        EquipmentEnums.StatusNormal, EquipmentEnums.StatusMaintenance, EquipmentEnums.StatusScrapped,
        ErrorMessage = "狀態只能是 normal / maintenance / scrapped")]
    public string Status { get; set; } = string.Empty;

    /// <summary>採購日期（選填，可 null）。非 null 時於 <see cref="Validate"/> 檢查不晚於今天。</summary>
    public DateOnly? PurchaseDate { get; set; }

    private string? _specNote;

    /// <summary>備註（選填）。空白正規化為 null。</summary>
    [StringLength(500, ErrorMessage = "備註長度不可超過 500 字")]
    public string? SpecNote
    {
        get => _specNote;
        set => _specNote = string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    /// <summary>跨欄位 / 條件驗證（對齊前端 save() 的非純字串規則）。</summary>
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        // keeperPhone 選填；非空才驗格式（空白已於 setter 正規化為 null）
        if (KeeperPhone is not null && !Regex.IsMatch(KeeperPhone, KeeperPhonePattern))
        {
            yield return new ValidationResult(
                "電話格式錯誤（手機 09xxxxxxxx 或市話 0X-XXXXXXXX）",
                [nameof(KeeperPhone)]);
        }

        // purchaseDate 選填；非 null 時不可晚於今天（本地時區，對齊前端 today 比較）
        if (PurchaseDate is { } date && date > DateOnly.FromDateTime(DateTime.Now))
        {
            yield return new ValidationResult(
                "採購日期不可晚於今天",
                [nameof(PurchaseDate)]);
        }
    }
}
