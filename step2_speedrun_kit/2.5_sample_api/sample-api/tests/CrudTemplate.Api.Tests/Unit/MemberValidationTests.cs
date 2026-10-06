using System.ComponentModel.DataAnnotations;
using CrudTemplate.Api.Models;

namespace CrudTemplate.Api.Tests.Unit;

/// <summary>
/// DTO 驗證單元測試（DESIGN §9.2：U1-U5 + U8）。
/// </summary>
/// <remarks>
/// 以 <see cref="Validator.TryValidateObject(object, ValidationContext, ICollection{ValidationResult}, bool)"/>
/// 復刻 MVC 行為：物件層級 IValidatableObject 僅在所有屬性層級 DataAnnotations 通過後才執行，
/// 故失敗案例一次只錯一個欄位（DESIGN §5）。
/// </remarks>
public class MemberValidationTests
{
    /// <summary>建立一份「完全合法」的請求作為基準，各測試只改一個欄位。</summary>
    private static MemberRequest ValidRequest() => new()
    {
        Name = "測試員",
        Gender = "男",
        BirthDate = new DateOnly(1990, 1, 1),
        IdType = "身分證",
        NationalId = "A123456789",
        Phone = "0912345678",
        Email = "test@example.tw",
        ResidenceCounty = "臺東縣",
        ResidenceTownship = "臺東市",
        ResidenceAddress = "某路1號",
        GroupName = "搶救組",
        PositionCode = "member",
        Qualifications = ["防災士"],
        Status = "在職",
        Note = "",
        BloodType = "O"
    };

    private static IList<ValidationResult> Validate(MemberRequest req)
    {
        var ctx = new ValidationContext(req);
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(req, ctx, results, validateAllProperties: true);
        return results;
    }

    private static bool HasErrorFor(IEnumerable<ValidationResult> results, string member) =>
        results.Any(r => r.MemberNames.Contains(member));

    // ── U1：身分證證號（BR-B-02）──────────────────────────────────
    [Fact] // U1
    public void U1_身分證合法證號_通過()
    {
        var req = ValidRequest();
        req.IdType = "身分證";
        req.NationalId = "A123456789";
        Assert.Empty(Validate(req));
    }

    [Theory] // U1
    [InlineData("A12345678")]   // 缺一碼
    [InlineData("a123456789")]  // 小寫開頭
    [InlineData("A323456789")]  // 第二碼非 1/2
    public void U1_身分證非法證號_失敗(string badId)
    {
        var req = ValidRequest();
        req.IdType = "身分證";
        req.NationalId = badId;
        Assert.True(HasErrorFor(Validate(req), nameof(MemberRequest.NationalId)));
    }

    // ── U2：居留證/護照僅檢查非空與長度上限（BR-B-02）─────────────
    [Theory] // U2
    [InlineData("居留證", "AC12345678")]
    [InlineData("護照", "PP1234567")]
    public void U2_居留證護照_一般證號通過(string idType, string nationalId)
    {
        var req = ValidRequest();
        req.IdType = idType;
        req.NationalId = nationalId;
        Assert.Empty(Validate(req));
    }

    [Fact] // U2：超過長度上限（20）→ 屬性層級 StringLength 失敗
    public void U2_證號超過長度上限_失敗()
    {
        var req = ValidRequest();
        req.IdType = "護照";
        req.NationalId = new string('A', 21);
        Assert.True(HasErrorFor(Validate(req), nameof(MemberRequest.NationalId)));
    }

    // ── U3：phone 格式（BR-B-03）──────────────────────────────────
    [Theory] // U3
    [InlineData("12345")]
    [InlineData("0812345678")]  // 非 09 開頭
    [InlineData("091234567")]   // 少一碼
    public void U3_電話格式錯誤_失敗(string phone)
    {
        var req = ValidRequest();
        req.Phone = phone;
        Assert.True(HasErrorFor(Validate(req), nameof(MemberRequest.Phone)));
    }

    // ── U4：email（BR-B-01）───────────────────────────────────────
    [Fact] // U4
    public void U4_email空字串_通過()
    {
        var req = ValidRequest();
        req.Email = "";
        Assert.Empty(Validate(req));
    }

    [Fact] // U4
    public void U4_email非空非法_失敗()
    {
        var req = ValidRequest();
        req.Email = "not-an-email";
        Assert.True(HasErrorFor(Validate(req), nameof(MemberRequest.Email)));
    }

    // ── U5：枚舉允許值（BR-B-09）──────────────────────────────────
    [Theory] // U5
    [InlineData("Gender", "X")]
    [InlineData("Status", "X")]
    [InlineData("IdType", "X")]
    [InlineData("PositionCode", "X")]
    public void U5_枚舉非允許值_失敗(string field, string badValue)
    {
        var req = ValidRequest();
        switch (field)
        {
            case "Gender": req.Gender = badValue; break;
            case "Status": req.Status = badValue; break;
            case "IdType": req.IdType = badValue; break;
            case "PositionCode": req.PositionCode = badValue; break;
        }
        Assert.True(HasErrorFor(Validate(req), field));
    }

    // ── U8：qualifications 驗證（BR-B-10，裁決新增）────────────────
    [Fact] // U8
    public void U8_qualifications_null_正規化為空陣列_通過()
    {
        var req = ValidRequest();
        req.Qualifications = null!;   // setter 應正規化為空陣列
        Assert.NotNull(req.Qualifications);
        Assert.Empty(req.Qualifications);
        Assert.Empty(Validate(req));
    }

    [Fact] // U8：超過 10 項
    public void U8_qualifications_超過10項_失敗()
    {
        var req = ValidRequest();
        req.Qualifications = Enumerable.Range(1, 11).Select(i => $"證照{i}").ToList();
        Assert.True(HasErrorFor(Validate(req), nameof(MemberRequest.Qualifications)));
    }

    [Theory] // U8：空白 / 超長
    [InlineData("   ")]
    [InlineData("")]
    public void U8_qualifications_空白項_失敗(string bad)
    {
        var req = ValidRequest();
        req.Qualifications = [bad];
        Assert.True(HasErrorFor(Validate(req), nameof(MemberRequest.Qualifications)));
    }

    [Fact] // U8：單項超過 30 字
    public void U8_qualifications_單項超長_失敗()
    {
        var req = ValidRequest();
        req.Qualifications = [new string('證', 31)];
        Assert.True(HasErrorFor(Validate(req), nameof(MemberRequest.Qualifications)));
    }

    // ── UB：bloodType 選填驗證（Contract v2，BR-B-11）──────────────
    [Fact] // UB1：未帶血型（null）→ 通過（選填）
    public void UB1_血型null_通過()
    {
        var req = ValidRequest();
        req.BloodType = null;
        Assert.Null(req.BloodType);
        Assert.Empty(Validate(req));
    }

    [Theory] // UB2：空字串 / 純空白 → setter 正規化為 null → 通過
    [InlineData("")]
    [InlineData("   ")]
    public void UB2_血型空白_正規化為null_通過(string blank)
    {
        var req = ValidRequest();
        req.BloodType = blank;
        Assert.Null(req.BloodType);   // setter 正規化
        Assert.Empty(Validate(req));
    }

    [Theory] // UB3：四個合法血型 → 通過
    [InlineData("A")]
    [InlineData("B")]
    [InlineData("AB")]
    [InlineData("O")]
    public void UB3_血型合法值_通過(string bloodType)
    {
        var req = ValidRequest();
        req.BloodType = bloodType;
        Assert.Empty(Validate(req));
    }

    [Fact] // UB4：非法血型（含小寫，證明大小寫敏感）→ 失敗，錯誤掛在 BloodType 成員
    public void UB4_血型非法值_失敗()
    {
        var req = ValidRequest();
        req.BloodType = "ab";   // 小寫非允許值
        Assert.True(HasErrorFor(Validate(req), nameof(MemberRequest.BloodType)));
    }
}
