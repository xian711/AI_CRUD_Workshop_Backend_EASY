namespace CrudTemplate.Api.Constants;

/// <summary>
/// 裝備物資枚舉字面值與編碼字典（逐字對齊前端 useEquipmentItems.ts 的
/// EQUIPMENT_CATEGORIES / ITEM_CODE_MAP / EQUIPMENT_STATUS_OPTIONS，DESIGN-delta §5）。
/// </summary>
/// <remarks>
/// 集中允許值於單一來源：DTO 的 <c>[AllowedValues]</c> 與 DB CHECK constraint 共用此處字面值。
/// <para>SCOPE Q3：分類不建表，改以常數清單驗證 <c>categoryKey ∈ 10 類</c>；
/// 類別碼（2 碼）與項目碼（3 碼）兩份字典搬到後端，供服務層產生品項編碼。
/// <c>name</c> 不驗證是否屬於該分類的標準項目（「其他」可自填、字典演進不動後端）。</para>
/// </remarks>
public static class EquipmentEnums
{
    // ── 狀態（對齊前端 EQUIPMENT_STATUS_OPTIONS）─────────────────────
    public const string StatusNormal = "normal";
    public const string StatusMaintenance = "maintenance";
    public const string StatusScrapped = "scrapped";
    public static readonly string[] Statuses = [StatusNormal, StatusMaintenance, StatusScrapped];

    // ── 10 大分類 value（對齊前端 EQUIPMENT_CATEGORIES 的 value）──────
    public const string CategoryIct = "ICT";
    public const string CategoryPower = "POWER";
    public const string CategoryStorage = "STORAGE";
    public const string CategoryOffice = "OFFICE";
    public const string CategoryPpe = "PPE";
    public const string CategoryShelterSupply = "SHELTER_SUPPLY";
    public const string CategoryEmfood = "EMFOOD";
    public const string CategoryMedical = "MEDICAL";
    public const string CategoryDecon = "DECON";
    public const string CategoryOther = "OTHER";

    public static readonly string[] CategoryKeys =
    [
        CategoryIct, CategoryPower, CategoryStorage, CategoryOffice, CategoryPpe,
        CategoryShelterSupply, CategoryEmfood, CategoryMedical, CategoryDecon, CategoryOther,
    ];

    /// <summary>查無分類 / 「其他」分類用的預設類別碼（對齊前端 codePrefixOf 的 fallback）。</summary>
    public const string DefaultCategoryCode = "OT";

    /// <summary>查無項目用的預設項目碼（對齊前端 ITEM_CODE_MAP fallback 'OTH'）。</summary>
    public const string DefaultItemCode = "OTH";

    /// <summary>分類 value → 2 碼類別碼（對齊前端 EQUIPMENT_CATEGORIES 的 code）。</summary>
    public static readonly IReadOnlyDictionary<string, string> CategoryCodeMap =
        new Dictionary<string, string>
        {
            [CategoryIct] = "IT",
            [CategoryPower] = "PW",
            [CategoryStorage] = "ST",
            [CategoryOffice] = "OF",
            [CategoryPpe] = "PP",
            [CategoryShelterSupply] = "SH",
            [CategoryEmfood] = "EF",
            [CategoryMedical] = "MD",
            [CategoryDecon] = "DC",
            [CategoryOther] = "OT",
        };

    /// <summary>項目名 → 3 碼項目碼（逐字對齊前端 ITEM_CODE_MAP；查無用 <see cref="DefaultItemCode"/>）。</summary>
    public static readonly IReadOnlyDictionary<string, string> ItemCodeMap =
        new Dictionary<string, string>
        {
            ["筆記型電腦"] = "LAP", ["平板電腦"] = "TAB", ["WIFI分享器"] = "WIF", ["行動箱"] = "MOB",
            ["發電機"] = "GEN", ["行動太陽能電板組"] = "SOL", ["儲能設備(主)"] = "ESM", ["儲能設備(輔)"] = "ESS", ["塔燈"] = "TWL",
            ["貨架角鋼"] = "RAK", ["溫濕度計"] = "THM", ["除濕機"] = "DEH",
            ["遮陽棚"] = "CAN", ["摺疊桌椅組"] = "TBC", ["摺疊推車"] = "CRT", ["移動式白板"] = "WBD", ["大型垃圾桶"] = "BIN",
            ["DC節能扇"] = "FAN", ["擴音器(大聲公)"] = "SPK", ["識別證與掛繩"] = "IDC", ["文書用品"] = "STA", ["電源延長線"] = "EXT", ["轉接頭"] = "ADP",
            ["哨子"] = "WHS", ["反光背心"] = "VST", ["頭燈"] = "HLP", ["手電筒"] = "FLA", ["頭盔"] = "HLM", ["口罩"] = "MSK",
            ["手套(拋棄式)"] = "GLD", ["手套(工作手套)"] = "GLW", ["雨衣"] = "RNC", ["防穿刺工作鞋"] = "SHO", ["避難包(EDC)"] = "EDC", ["行動電源(個人用)"] = "PWB",
            ["避難帳篷"] = "TNT", ["折疊床墊(睡墊)"] = "MAT", ["保暖毯"] = "BLK", ["緊急睡袋"] = "SLP", ["儲水桶"] = "WTK",
            ["即時口糧"] = "RTE", ["補充型口糧"] = "SUP", ["鹽糖"] = "SLT",
            ["簡易廁所組"] = "TLT", ["擔架床/軟式擔架"] = "STR", ["止血帶"] = "TQT", ["急救箱"] = "FAK", ["盥洗用具"] = "HYG",
            ["加壓式免電力緊急淨水設備"] = "PWP", ["重力式緊急濾水器"] = "GWF", ["免電力緊急消毒劑製造設備"] = "DSF",
        };

    /// <summary>分類 value → 2 碼類別碼；查無回 <see cref="DefaultCategoryCode"/>。</summary>
    public static string CategoryCodeOf(string categoryKey) =>
        CategoryCodeMap.GetValueOrDefault(categoryKey, DefaultCategoryCode);

    /// <summary>項目名 → 3 碼項目碼；查無回 <see cref="DefaultItemCode"/>（自動 trim）。</summary>
    public static string ItemCodeOf(string name) =>
        ItemCodeMap.GetValueOrDefault(name.Trim(), DefaultItemCode);

    /// <summary>組品項編碼前綴 <c>{類別碼}-{項目碼}-</c>（對齊前端 codePrefixOf）。</summary>
    public static string CodePrefixOf(string categoryKey, string name) =>
        $"{CategoryCodeOf(categoryKey)}-{ItemCodeOf(name)}-";
}
