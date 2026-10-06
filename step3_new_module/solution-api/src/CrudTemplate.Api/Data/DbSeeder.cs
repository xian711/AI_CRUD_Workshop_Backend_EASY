using CrudTemplate.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace CrudTemplate.Api.Data;

/// <summary>
/// 冪等 seed：資料表為空才植入 24 筆種子（DESIGN §8，FR-B-602 / NFR-B-02）。
/// </summary>
/// <remarks>
/// 假設單一應用實例啟動；多實例同時冷啟的競態（兩邊都判空而重複植入）不在本教學範圍。
/// </remarks>
public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        SeedMembers(db);
        SeedEquipment(db);
    }

    /// <summary>冪等植入 24 筆人員種子（表空才植入）。</summary>
    private static void SeedMembers(AppDbContext db)
    {
        // 冪等：非空即跳過（重啟不重複植入、不報錯）
        if (db.Members.Any()) return;

        // 以「新實體」植入，避免 SeedData 的靜態實例被跨 context 追蹤
        db.Members.AddRange(SeedData.Members.Select(CloneForSeed));
        db.SaveChanges();

        // 確保後續新增從 M-025 起（種子用顯式 id，不動用 SEQUENCE；此處對齊起點以防序號已被推進）
        db.Database.ExecuteSqlRaw(
            $"ALTER SEQUENCE {AppDbContext.MemberSequenceName} RESTART WITH 25;");
    }

    /// <summary>冪等植入 24 筆裝備物資種子（與 Members 各自獨立判斷，表空才植入）。</summary>
    private static void SeedEquipment(AppDbContext db)
    {
        if (db.EquipmentItems.Any()) return;

        db.EquipmentItems.AddRange(EquipmentSeedData.Items.Select(CloneForSeed));
        db.SaveChanges();

        // 確保後續新增從 E-025 起（種子用顯式 id）
        db.Database.ExecuteSqlRaw(
            $"ALTER SEQUENCE {AppDbContext.EquipmentSequenceName} RESTART WITH 25;");
    }

    /// <summary>複製一份裝備種子實體，避免共用參考。</summary>
    private static EquipmentItem CloneForSeed(EquipmentItem e) => new()
    {
        Id = e.Id,
        Code = e.Code,
        CategoryKey = e.CategoryKey,
        Name = e.Name,
        Qty = e.Qty,
        Unit = e.Unit,
        Spec1 = e.Spec1,
        Keeper = e.Keeper,
        KeeperPhone = e.KeeperPhone,
        LocationName = e.LocationName,
        Status = e.Status,
        PurchaseDate = e.PurchaseDate,
        SpecNote = e.SpecNote,
        UpdatedAt = e.UpdatedAt
    };

    /// <summary>複製一份種子實體（含陣列深拷貝），避免共用參考。</summary>
    private static Member CloneForSeed(Member m) => new()
    {
        Id = m.Id,
        Name = m.Name,
        Gender = m.Gender,
        BirthDate = m.BirthDate,
        IdType = m.IdType,
        NationalId = m.NationalId,
        Phone = m.Phone,
        Email = m.Email,
        ResidenceCounty = m.ResidenceCounty,
        ResidenceTownship = m.ResidenceTownship,
        ResidenceAddress = m.ResidenceAddress,
        GroupName = m.GroupName,
        PositionCode = m.PositionCode,
        Qualifications = [.. m.Qualifications],
        Status = m.Status,
        Note = m.Note,
        BloodType = m.BloodType,
        UpdatedAt = m.UpdatedAt
    };
}
