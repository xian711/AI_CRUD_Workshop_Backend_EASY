using CrudTemplate.Api.Entities;

namespace CrudTemplate.Api.Data;

/// <summary>
/// 24 筆裝備物資種子字面量（逐欄對齊前端 useEquipmentItems.ts 的 SEED，SDD-delta §8）。
/// </summary>
/// <remarks>
/// 顯性、非產生器：id 為 E-001..E-024，對應前端 ensureSeeded 的 padStart(3) 序號、code 逐字相同。
/// <para>正規化決策（SDD-delta §5）：前端 SEED 的空字串選填欄位（keeper / keeperPhone / locationName /
/// specNote）於 DB 一律存 null；purchaseDate 空字串存 null——與 DTO setter 的空白→null 正規化一致。</para>
/// <para>前端 EquipmentItem 無 updatedAt 欄位，種子的 <c>UpdatedAt</c> 統一設為固定基準日
/// <c>2026-07-11</c>（顯性、決定性）。</para>
/// 種子為虛構測試資料（品名取自真實裝備清單，數量 / 保管人 / 地點皆為演示杜撰）。
/// </remarks>
public static class EquipmentSeedData
{
    /// <summary>字串 yyyy-MM-dd → DateOnly（本地日期語意，無時區轉換）。</summary>
    private static DateOnly D(string value) => DateOnly.Parse(value);

    /// <summary>種子固定更新基準日（前端 mock 無此欄，後端顯性補值）。</summary>
    private static readonly DateOnly SeedUpdatedAt = D("2026-07-11");

    public static IReadOnlyList<EquipmentItem> Items { get; } =
    [
        new() { Id = "E-001", Code = "IT-LAP-001", CategoryKey = "ICT", Name = "筆記型電腦", Qty = 12, Unit = "台", Spec1 = "14 吋商用機，i5／16G／512G SSD", Keeper = "陳建豪", KeeperPhone = "0912345678", LocationName = "協作中心 2F 資訊機房", Status = "normal", PurchaseDate = D("2024-03-15"), SpecNote = "含原廠充電器", UpdatedAt = SeedUpdatedAt },
        new() { Id = "E-002", Code = "IT-LAP-002", CategoryKey = "ICT", Name = "筆記型電腦", Qty = 3, Unit = "台", Spec1 = "15 吋文書機，i3／8G／256G SSD", Keeper = "林淑芬", KeeperPhone = "0922333444", LocationName = "協作中心 2F 資訊機房", Status = "maintenance", PurchaseDate = D("2022-06-10"), SpecNote = "2 台鍵盤故障待修", UpdatedAt = SeedUpdatedAt },
        new() { Id = "E-003", Code = "IT-TAB-001", CategoryKey = "ICT", Name = "平板電腦", Qty = 8, Unit = "台", Spec1 = "10 吋，含防摔保護殼", Keeper = "王志明", KeeperPhone = null, LocationName = "協作中心 1F 器材室", Status = "normal", PurchaseDate = D("2024-09-01"), SpecNote = null, UpdatedAt = SeedUpdatedAt },
        new() { Id = "E-004", Code = "IT-WIF-001", CategoryKey = "ICT", Name = "WIFI分享器", Qty = 6, Unit = "台", Spec1 = "4G LTE 行動網路分享器", Keeper = null, KeeperPhone = null, LocationName = "協作中心 1F 器材室", Status = "normal", PurchaseDate = null, SpecNote = "SIM 卡另計", UpdatedAt = SeedUpdatedAt },
        new() { Id = "E-005", Code = "IT-MOB-001", CategoryKey = "ICT", Name = "行動箱", Qty = 2, Unit = "箱", Spec1 = "整合供電與網路之行動指揮箱", Keeper = "許家豪", KeeperPhone = "0943444555", LocationName = "協作中心 1F 器材室", Status = "scrapped", PurchaseDate = D("2019-01-20"), SpecNote = "主機板燒毀，待報廢除帳", UpdatedAt = SeedUpdatedAt },
        new() { Id = "E-006", Code = "PW-GEN-001", CategoryKey = "POWER", Name = "發電機", Qty = 4, Unit = "台", Spec1 = "汽油發電機 3kW，附輪組", Keeper = "李國強", KeeperPhone = "0966777888", LocationName = "後勤倉庫 A 區", Status = "normal", PurchaseDate = D("2023-11-05"), SpecNote = null, UpdatedAt = SeedUpdatedAt },
        new() { Id = "E-007", Code = "PW-GEN-002", CategoryKey = "POWER", Name = "發電機", Qty = 1, Unit = "台", Spec1 = "柴油發電機 5kW", Keeper = "李國強", KeeperPhone = "0966777888", LocationName = "後勤倉庫 A 區", Status = "maintenance", PurchaseDate = D("2021-04-18"), SpecNote = "定期保養送修中", UpdatedAt = SeedUpdatedAt },
        new() { Id = "E-008", Code = "PW-TWL-001", CategoryKey = "POWER", Name = "塔燈", Qty = 3, Unit = "組", Spec1 = "LED 移動式照明塔，升降 6M", Keeper = null, KeeperPhone = null, LocationName = "後勤倉庫 A 區", Status = "normal", PurchaseDate = D("2024-02-28"), SpecNote = null, UpdatedAt = SeedUpdatedAt },
        new() { Id = "E-009", Code = "ST-DEH-001", CategoryKey = "STORAGE", Name = "除濕機", Qty = 5, Unit = "台", Spec1 = "12 公升／日，適用倉儲防潮", Keeper = "周淑惠", KeeperPhone = "0954555666", LocationName = "後勤倉庫 B 區", Status = "normal", PurchaseDate = D("2023-07-12"), SpecNote = null, UpdatedAt = SeedUpdatedAt },
        new() { Id = "E-010", Code = "ST-THM-001", CategoryKey = "STORAGE", Name = "溫濕度計", Qty = 10, Unit = "個", Spec1 = "數位式溫濕度計", Keeper = null, KeeperPhone = null, LocationName = "後勤倉庫 B 區", Status = "normal", PurchaseDate = null, SpecNote = null, UpdatedAt = SeedUpdatedAt },
        new() { Id = "E-011", Code = "OF-TBC-001", CategoryKey = "OFFICE", Name = "摺疊桌椅組", Qty = 20, Unit = "組", Spec1 = "一桌四椅，塑鋼材質", Keeper = "鄭文彬", KeeperPhone = "0932333444", LocationName = "協作中心 B1 儲藏室", Status = "normal", PurchaseDate = D("2024-01-10"), SpecNote = null, UpdatedAt = SeedUpdatedAt },
        new() { Id = "E-012", Code = "OF-BIN-001", CategoryKey = "OFFICE", Name = "大型垃圾桶", Qty = 15, Unit = "個", Spec1 = "子母車 240L，附輪", Keeper = null, KeeperPhone = null, LocationName = "協作中心 B1 儲藏室", Status = "normal", PurchaseDate = D("2023-05-22"), SpecNote = null, UpdatedAt = SeedUpdatedAt },
        new() { Id = "E-013", Code = "OF-SPK-001", CategoryKey = "OFFICE", Name = "擴音器(大聲公)", Qty = 6, Unit = "支", Spec1 = "手持式擴音器 25W，附充電座", Keeper = "許家豪", KeeperPhone = "0943444555", LocationName = "協作中心 1F 器材室", Status = "normal", PurchaseDate = D("2024-04-03"), SpecNote = null, UpdatedAt = SeedUpdatedAt },
        new() { Id = "E-014", Code = "PP-HLM-001", CategoryKey = "PPE", Name = "頭盔", Qty = 30, Unit = "頂", Spec1 = "工程安全帽，附下巴帶", Keeper = "黃俊傑", KeeperPhone = "0910111222", LocationName = "搶救組裝備間", Status = "normal", PurchaseDate = D("2023-09-15"), SpecNote = null, UpdatedAt = SeedUpdatedAt },
        new() { Id = "E-015", Code = "PP-FLA-001", CategoryKey = "PPE", Name = "手電筒", Qty = 40, Unit = "支", Spec1 = "LED 強光手電筒，充電式", Keeper = null, KeeperPhone = null, LocationName = "搶救組裝備間", Status = "normal", PurchaseDate = D("2024-06-08"), SpecNote = "含 18650 電池", UpdatedAt = SeedUpdatedAt },
        new() { Id = "E-016", Code = "PP-VST-001", CategoryKey = "PPE", Name = "反光背心", Qty = 8, Unit = "件", Spec1 = "高視度反光背心 L 號", Keeper = null, KeeperPhone = null, LocationName = "搶救組裝備間", Status = "scrapped", PurchaseDate = D("2018-03-01"), SpecNote = "反光條老化，汰換中", UpdatedAt = SeedUpdatedAt },
        new() { Id = "E-017", Code = "SH-TNT-001", CategoryKey = "SHELTER_SUPPLY", Name = "避難帳篷", Qty = 10, Unit = "頂", Spec1 = "4 人快速搭建帳篷，防水", Keeper = "簡淑貞", KeeperPhone = "0939000111", LocationName = "收容物資倉庫", Status = "normal", PurchaseDate = D("2024-05-20"), SpecNote = null, UpdatedAt = SeedUpdatedAt },
        new() { Id = "E-018", Code = "SH-BLK-001", CategoryKey = "SHELTER_SUPPLY", Name = "保暖毯", Qty = 100, Unit = "件", Spec1 = "刷毛保暖毯 150×200cm", Keeper = null, KeeperPhone = null, LocationName = "收容物資倉庫", Status = "normal", PurchaseDate = D("2023-12-01"), SpecNote = null, UpdatedAt = SeedUpdatedAt },
        new() { Id = "E-019", Code = "EF-RTE-001", CategoryKey = "EMFOOD", Name = "即時口糧", Qty = 200, Unit = "包", Spec1 = "即食主食包，保存期 3 年", Keeper = "吳雅婷", KeeperPhone = "0977888999", LocationName = "緊急物資倉庫", Status = "normal", PurchaseDate = D("2025-01-05"), SpecNote = "效期 2028-01", UpdatedAt = SeedUpdatedAt },
        new() { Id = "E-020", Code = "EF-SLT-001", CategoryKey = "EMFOOD", Name = "鹽糖", Qty = 150, Unit = "包", Spec1 = "補充電解質鹽糖", Keeper = null, KeeperPhone = null, LocationName = "緊急物資倉庫", Status = "normal", PurchaseDate = null, SpecNote = null, UpdatedAt = SeedUpdatedAt },
        new() { Id = "E-021", Code = "MD-FAK-001", CategoryKey = "MEDICAL", Name = "急救箱", Qty = 12, Unit = "箱", Spec1 = "綜合急救箱，含止血敷料", Keeper = "潘美惠", KeeperPhone = "0973444555", LocationName = "醫護站", Status = "normal", PurchaseDate = D("2024-08-14"), SpecNote = "每季盤點耗材", UpdatedAt = SeedUpdatedAt },
        new() { Id = "E-022", Code = "MD-STR-001", CategoryKey = "MEDICAL", Name = "擔架床/軟式擔架", Qty = 6, Unit = "副", Spec1 = "摺疊式軟擔架，附固定帶", Keeper = null, KeeperPhone = null, LocationName = "醫護站", Status = "maintenance", PurchaseDate = D("2022-10-30"), SpecNote = "1 副扣具鬆脫待修", UpdatedAt = SeedUpdatedAt },
        new() { Id = "E-023", Code = "DC-GWF-001", CategoryKey = "DECON", Name = "重力式緊急濾水器", Qty = 8, Unit = "組", Spec1 = "重力式濾水器，日產 30L", Keeper = null, KeeperPhone = null, LocationName = "緊急物資倉庫", Status = "normal", PurchaseDate = D("2024-03-22"), SpecNote = "濾芯備品另存", UpdatedAt = SeedUpdatedAt },
        new() { Id = "E-024", Code = "OT-OTH-001", CategoryKey = "OTHER", Name = "柴油儲油桶", Qty = 6, Unit = "個", Spec1 = "200L 金屬儲油桶，附油泵", Keeper = "洪世昌", KeeperPhone = "0940111222", LocationName = "後勤倉庫 A 區", Status = "normal", PurchaseDate = D("2023-06-18"), SpecNote = "危險物品分區存放", UpdatedAt = SeedUpdatedAt },
    ];
}
