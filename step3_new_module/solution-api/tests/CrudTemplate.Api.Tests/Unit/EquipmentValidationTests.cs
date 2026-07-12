using System.ComponentModel.DataAnnotations;
using CrudTemplate.Api.Models;

namespace CrudTemplate.Api.Tests.Unit;

/// <summary>
/// 裝備物資 DTO 驗證單元測試（SDD-delta §9.2）。逐欄對齊前端 [id].vue 驗證規則。
/// </summary>
/// <remarks>
/// 以 <see cref="Validator.TryValidateObject(object, ValidationContext, ICollection{ValidationResult}, bool)"/>
/// 復刻 MVC 行為：物件層級 IValidatableObject 僅在屬性層級 DataAnnotations 通過後才執行。
/// </remarks>
public class EquipmentValidationTests
{
    /// <summary>「完全合法」基準請求，各測試只改一個欄位。</summary>
    private static EquipmentItemRequest ValidRequest() => new()
    {
        CategoryKey = "ICT",
        Name = "筆記型電腦",
        Qty = 3,
        Unit = "台",
        Spec1 = "測試規格",
        Keeper = "測試員",
        KeeperPhone = "0912345678",
        LocationName = "測試倉庫",
        Status = "normal",
        PurchaseDate = new DateOnly(2024, 1, 1),
        SpecNote = "備註"
    };

    private static IList<ValidationResult> Validate(EquipmentItemRequest req)
    {
        var ctx = new ValidationContext(req);
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(req, ctx, results, validateAllProperties: true);
        return results;
    }

    private static bool HasErrorFor(IEnumerable<ValidationResult> results, string member) =>
        results.Any(r => r.MemberNames.Contains(member));

    // ── EV1：基準合法請求通過 ──
    [Fact] // EV1
    public void EV1_合法請求_通過()
    {
        Assert.Empty(Validate(ValidRequest()));
    }

    // ── EV2：必填字串欄缺漏 → 失敗 ──
    [Theory] // EV2
    [InlineData("CategoryKey")]
    [InlineData("Name")]
    [InlineData("Unit")]
    [InlineData("Spec1")]
    [InlineData("Status")]
    public void EV2_必填字串欄為空_失敗(string field)
    {
        var req = ValidRequest();
        switch (field)
        {
            case "CategoryKey": req.CategoryKey = ""; break;
            case "Name": req.Name = ""; break;
            case "Unit": req.Unit = ""; break;
            case "Spec1": req.Spec1 = ""; break;
            case "Status": req.Status = ""; break;
        }
        Assert.True(HasErrorFor(Validate(req), field));
    }

    // ── EV3：qty 省略（null）→ Required 失敗 ──
    [Fact] // EV3
    public void EV3_數量省略_失敗()
    {
        var req = ValidRequest();
        req.Qty = null;
        Assert.True(HasErrorFor(Validate(req), nameof(EquipmentItemRequest.Qty)));
    }

    // ── EV4：qty 小於 0 → Range 失敗（前端「數量不可小於 0」）──
    [Fact] // EV4
    public void EV4_數量負值_失敗()
    {
        var req = ValidRequest();
        req.Qty = -1;
        Assert.True(HasErrorFor(Validate(req), nameof(EquipmentItemRequest.Qty)));
    }

    // ── EV5：qty = 0 → 合法（前端 :min="0"）──
    [Fact] // EV5
    public void EV5_數量零_通過()
    {
        var req = ValidRequest();
        req.Qty = 0;
        Assert.Empty(Validate(req));
    }

    // ── EV6：categoryKey 不在 10 類清單 → 失敗 ──
    [Fact] // EV6
    public void EV6_分類不在清單_失敗()
    {
        var req = ValidRequest();
        req.CategoryKey = "UNKNOWN";
        Assert.True(HasErrorFor(Validate(req), nameof(EquipmentItemRequest.CategoryKey)));
    }

    // ── EV7：status 非法值 → 失敗 ──
    [Theory] // EV7
    [InlineData("Normal")]   // 大小寫敏感
    [InlineData("broken")]
    public void EV7_狀態非法_失敗(string bad)
    {
        var req = ValidRequest();
        req.Status = bad;
        Assert.True(HasErrorFor(Validate(req), nameof(EquipmentItemRequest.Status)));
    }

    // ── EV8：keeperPhone 合法（手機 / 市話）→ 通過 ──
    [Theory] // EV8
    [InlineData("0912345678")]   // 手機
    [InlineData("089-123456")]   // 市話含連字號
    [InlineData("0287654321")]   // 市話無連字號
    public void EV8_電話合法_通過(string phone)
    {
        var req = ValidRequest();
        req.KeeperPhone = phone;
        Assert.Empty(Validate(req));
    }

    // ── EV9：keeperPhone 非法 → 失敗 ──
    [Theory] // EV9
    [InlineData("12345")]
    [InlineData("09123")]
    [InlineData("abcdefghij")]
    public void EV9_電話非法_失敗(string phone)
    {
        var req = ValidRequest();
        req.KeeperPhone = phone;
        Assert.True(HasErrorFor(Validate(req), nameof(EquipmentItemRequest.KeeperPhone)));
    }

    // ── EV10：keeperPhone 空白 → setter 正規化為 null → 通過（選填）──
    [Theory] // EV10
    [InlineData("")]
    [InlineData("   ")]
    public void EV10_電話空白_正規化為null_通過(string blank)
    {
        var req = ValidRequest();
        req.KeeperPhone = blank;
        Assert.Null(req.KeeperPhone);
        Assert.Empty(Validate(req));
    }

    // ── EV11：purchaseDate null → 通過（選填）──
    [Fact] // EV11
    public void EV11_採購日期null_通過()
    {
        var req = ValidRequest();
        req.PurchaseDate = null;
        Assert.Empty(Validate(req));
    }

    // ── EV12：purchaseDate 晚於今天 → 失敗（前端「採購日期不可晚於今天」）──
    [Fact] // EV12
    public void EV12_採購日期未來_失敗()
    {
        var req = ValidRequest();
        req.PurchaseDate = DateOnly.FromDateTime(DateTime.Now).AddDays(1);
        Assert.True(HasErrorFor(Validate(req), nameof(EquipmentItemRequest.PurchaseDate)));
    }

    // ── EV13：選填字串欄空白 → 正規化為 null，通過 ──
    [Fact] // EV13
    public void EV13_選填字串空白_正規化為null_通過()
    {
        var req = ValidRequest();
        req.Keeper = "";
        req.LocationName = "   ";
        req.SpecNote = "";
        Assert.Null(req.Keeper);
        Assert.Null(req.LocationName);
        Assert.Null(req.SpecNote);
        Assert.Empty(Validate(req));
    }
}
