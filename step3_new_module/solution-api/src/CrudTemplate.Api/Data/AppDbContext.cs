using System.Text;
using CrudTemplate.Api.Constants;
using CrudTemplate.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace CrudTemplate.Api.Data;

/// <summary>
/// 範本資料庫上下文（PostgreSQL，D2）。
/// </summary>
/// <remarks>
/// PascalCase 屬性以命名轉換映射為 snake_case 欄位（NFR-B-07，對齊原單位範本）。
/// CHECK constraint 與 SEQUENCE 皆於此設定，隨 Migration 落地（SDD §4.2 / §4.3）。
/// </remarks>
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    /// <summary>主鍵產生用 SEQUENCE 名稱（BR-B-07）。</summary>
    public const string MemberSequenceName = "template_member_seq";

    /// <summary>裝備物資主鍵產生用 SEQUENCE 名稱（SCOPE Q2，E-### 起 25）。</summary>
    public const string EquipmentSequenceName = "equipment_item_seq";

    /// <summary>裝備物資 code 具名唯一索引（SCOPE Q1）。</summary>
    public const string EquipmentCodeIndexName = "ux_equipment_item_code";

    public DbSet<Member> Members => Set<Member>();

    public DbSet<EquipmentItem> EquipmentItems => Set<EquipmentItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── 主鍵 SEQUENCE：從 25 起（24 筆種子之後），保證併發下唯一遞增（SDD §4.2）──
        modelBuilder.HasSequence<int>(MemberSequenceName)
            .StartsAt(25)
            .IncrementsBy(1);

        // ── 裝備物資主鍵 SEQUENCE：同樣從 25 起（E-001~E-024 種子之後）──
        modelBuilder.HasSequence<int>(EquipmentSequenceName)
            .StartsAt(25)
            .IncrementsBy(1);

        ConfigureEquipmentItem(modelBuilder);

        modelBuilder.Entity<Member>(entity =>
        {
            entity.ToTable("template_member", table =>
            {
                // CHECK constraint 的 SQL 由 Constants/MemberEnums.cs 常數陣列組出，
                // 與 DTO 的 [AllowedValues] 共用同一份字面值來源，避免兩邊漂移（SDD §5）。
                // PostgreSQL 一律 UTF-8，中文字面值不需 N'' 前綴（有別於舊 SQL Server 版）。
                table.HasCheckConstraint("ck_template_member_gender", BuildCheckInSql("gender", MemberEnums.Genders));
                table.HasCheckConstraint("ck_template_member_id_type", BuildCheckInSql("id_type", MemberEnums.IdTypes));
                table.HasCheckConstraint("ck_template_member_position_code", BuildCheckInSql("position_code", MemberEnums.PositionCodes));
                table.HasCheckConstraint("ck_template_member_status", BuildCheckInSql("status", MemberEnums.Statuses));
                // Contract v2：blood_type 選填。IN (...) 對 NULL 求值為 NULL，CHECK 視為通過，故 NULL 自然放行。
                table.HasCheckConstraint("ck_template_member_blood_type", BuildCheckInSql("blood_type", MemberEnums.BloodTypes));
            });

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).HasMaxLength(10);
            entity.Property(e => e.Name).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Gender).HasMaxLength(2).IsRequired();
            entity.Property(e => e.BirthDate).HasColumnType("date").IsRequired();
            entity.Property(e => e.IdType).HasMaxLength(10).IsRequired();
            entity.Property(e => e.NationalId).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Phone).HasMaxLength(10).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.ResidenceCounty).HasMaxLength(10).IsRequired();
            entity.Property(e => e.ResidenceTownship).HasMaxLength(10).IsRequired();
            entity.Property(e => e.ResidenceAddress).HasMaxLength(100).IsRequired();
            entity.Property(e => e.GroupName).HasMaxLength(20).IsRequired();
            entity.Property(e => e.PositionCode).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Status).HasMaxLength(4).IsRequired();
            entity.Property(e => e.Note).HasMaxLength(500);
            // Contract v2：blood_type 為 text NULL（選填，允許值由 CHECK 約束把關，見上）。
            entity.Property(e => e.BloodType).HasColumnType("text");
            entity.Property(e => e.UpdatedAt).HasColumnType("date").IsRequired();

            // qualifications：EF primitive collection → PostgreSQL 原生 text[] 陣列欄位（SDD §4.3）
            entity.PrimitiveCollection(e => e.Qualifications)
                .HasColumnType("text[]")
                .IsRequired()
                .HasDefaultValueSql("'{}'");
        });

        // ── 以 snake_case 命名所有欄位（與 CHECK constraint 內引用之欄位名一致）──
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entity.GetProperties())
                property.SetColumnName(ToSnakeCase(property.GetColumnName()));
        }
    }

    /// <summary>
    /// 裝備物資實體設定：表 <c>equipment_item</c>、CHECK（status / category_key）、
    /// code 具名唯一索引（SDD-delta §4）。
    /// </summary>
    private static void ConfigureEquipmentItem(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<EquipmentItem>(entity =>
        {
            entity.ToTable("equipment_item", table =>
            {
                // CHECK 由 Constants/EquipmentEnums.cs 常數陣列組出，與 DTO [AllowedValues] 共用字面值。
                table.HasCheckConstraint("ck_equipment_item_status", BuildCheckInSql("status", EquipmentEnums.Statuses));
                table.HasCheckConstraint("ck_equipment_item_category_key", BuildCheckInSql("category_key", EquipmentEnums.CategoryKeys));
            });

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).HasMaxLength(10);
            entity.Property(e => e.Code).HasMaxLength(20).IsRequired();
            entity.Property(e => e.CategoryKey).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Name).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Qty).IsRequired();
            entity.Property(e => e.Unit).HasMaxLength(10).IsRequired();
            entity.Property(e => e.Spec1).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Keeper).HasMaxLength(50);
            entity.Property(e => e.KeeperPhone).HasMaxLength(20);
            entity.Property(e => e.LocationName).HasMaxLength(100);
            entity.Property(e => e.Status).HasMaxLength(12).IsRequired();
            entity.Property(e => e.PurchaseDate).HasColumnType("date");
            entity.Property(e => e.SpecNote).HasMaxLength(500);
            entity.Property(e => e.UpdatedAt).HasColumnType("date").IsRequired();

            // code 具名唯一索引（SCOPE Q1，同前綴 MAX+1 取號的最後防線）
            entity.HasIndex(e => e.Code)
                .IsUnique()
                .HasDatabaseName(EquipmentCodeIndexName);
        });
    }

    /// <summary>
    /// 組出 <c>col IN ('a', 'b', ...)</c> 形式的 CHECK constraint SQL（單一來源，SDD §5）。
    /// 產出字串須與既有 Migration 逐字元一致，否則 EF 會判定 model 已變更。
    /// </summary>
    /// <param name="columnName">欄位名（snake_case）。</param>
    /// <param name="allowedValues">允許值清單（來自 <see cref="MemberEnums"/>）。</param>
    /// <remarks>PostgreSQL 一律 UTF-8，字面值統一單引號，中文不需 <c>N''</c> 前綴。</remarks>
    private static string BuildCheckInSql(string columnName, IReadOnlyList<string> allowedValues)
    {
        var values = string.Join(", ", allowedValues.Select(v => $"'{v}'"));
        return $"{columnName} IN ({values})";
    }

    /// <summary>PascalCase → snake_case（沿用原單位範本）。</summary>
    private static string ToSnakeCase(string name)
    {
        var sb = new StringBuilder();
        for (var i = 0; i < name.Length; i++)
        {
            var c = name[i];
            if (char.IsUpper(c))
            {
                if (i > 0 && !char.IsUpper(name[i - 1])) sb.Append('_');
                sb.Append(char.ToLowerInvariant(c));
            }
            else
            {
                sb.Append(c);
            }
        }

        return sb.ToString();
    }
}
