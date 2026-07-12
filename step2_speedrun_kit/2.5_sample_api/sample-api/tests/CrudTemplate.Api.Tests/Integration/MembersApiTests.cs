using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using CrudTemplate.Api.Common;
using CrudTemplate.Api.Data;
using CrudTemplate.Api.Models;
using CrudTemplate.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;

namespace CrudTemplate.Api.Tests.Integration;

/// <summary>
/// 端到端整合測試（SDD §9.3：I1-I15）。打 PostgreSQL 測試 DB。
/// </summary>
[Collection("Api")]
public class MembersApiTests(DatabaseFixture fixture)
{
    private const string BaseUrl = "/api/template/members";

    private static readonly JsonSerializerOptions Json = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private HttpClient Client() => fixture.Factory.CreateClient();

    /// <summary>
    /// 合法請求範本（各測試按需微調）。
    /// nationalId 可覆寫：持久寫入的測試各自帶「彼此不同的合法證號」，避免共用同一值——
    /// 這樣即使日後為 D14 加上 nationalId UNIQUE 索引（Lab 演練），既有基準測試也不會互撞而變紅（R6 測試隔離）。
    /// </summary>
    private static object ValidPayload(string phone = "0911222333", string email = "new@example.tw",
        string nationalId = "A223456789") => new
    {
        name = "新人員",
        gender = "女",
        birthDate = "1990-01-01",
        idType = "身分證",
        nationalId,
        phone,
        email,
        residenceCounty = "臺東縣",
        residenceTownship = "臺東市",
        residenceAddress = "某路1號",
        groupName = "搶救組",
        positionCode = "member",
        qualifications = new[] { "防災士" },
        status = "在職",
        note = "",
        bloodType = "O"
    };

    private static async Task<ModelResult<T>?> ReadModelResult<T>(HttpResponseMessage resp)
    {
        var text = await resp.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<ModelResult<T>>(text, Json);
    }

    // ── I1：GET 清單 ─────────────────────────────────────────────
    [Fact] // I1
    public async Task I1_取得清單_至少24筆含M001至M024且升冪()
    {
        var resp = await Client().GetAsync(BaseUrl);
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);

        var body = await ReadModelResult<List<MemberResult>>(resp);
        Assert.NotNull(body);
        Assert.True(body!.Success);
        var list = body.Data!;

        // 至少 24 筆（共用 factory 下寫入測試會增筆，故不斷言「恰 24 筆」）
        Assert.True(list.Count >= 24, $"期望至少 24 筆，實得 {list.Count}");

        // 含 M-001 ~ M-024
        for (var i = 1; i <= 24; i++)
            Assert.Contains(list, m => m.Id == $"M-{i:D3}");

        // id 升冪
        var ids = list.Select(m => m.Id).ToList();
        Assert.Equal(ids.OrderBy(x => x, StringComparer.Ordinal), ids);
    }

    // ── I2：GET 單筆存在 ─────────────────────────────────────────
    [Fact] // I2
    public async Task I2_取得單筆存在_200且id相符()
    {
        var resp = await Client().GetAsync($"{BaseUrl}/M-001");
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);

        var body = await ReadModelResult<MemberResult>(resp);
        Assert.True(body!.Success);
        Assert.Equal("M-001", body.Data!.Id);
        Assert.Equal("陳建豪", body.Data.Name);
    }

    // ── I3：GET 單筆不存在 ───────────────────────────────────────
    [Fact] // I3
    public async Task I3_取得單筆不存在_404且繁中訊息()
    {
        var resp = await Client().GetAsync($"{BaseUrl}/M-999");
        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);

        var body = await ReadModelResult<MemberResult>(resp);
        Assert.False(body!.Success);
        Assert.Contains("找不到人員 M-999", body.Message);
    }

    // ── I4：POST 合法 ────────────────────────────────────────────
    [Fact] // I4
    public async Task I4_新增合法_201且Location與自產id與今天updatedAt()
    {
        var client = Client();

        // 請求前既有 id 集合
        var before = await ReadModelResult<List<MemberResult>>(await client.GetAsync(BaseUrl));
        var existingIds = before!.Data!.Select(m => m.Id).ToHashSet();

        var resp = await client.PostAsJsonAsync(BaseUrl, ValidPayload(nationalId: "A210000004"), Json);
        Assert.Equal(HttpStatusCode.Created, resp.StatusCode);
        Assert.NotNull(resp.Headers.Location);   // Location 標頭

        var body = await ReadModelResult<MemberResult>(resp);
        Assert.True(body!.Success);
        var created = body.Data!;

        // id 符合 ^M-\d{3,}$ 且非請求前既有 id（不斷言固定 M-025）
        Assert.Matches(@"^M-\d{3,}$", created.Id);
        Assert.DoesNotContain(created.Id, existingIds);

        // updatedAt = 今天（本地時區）
        Assert.Equal(DateOnly.FromDateTime(DateTime.Now), created.UpdatedAt);
    }

    // ── I5：POST 電話格式錯 ──────────────────────────────────────
    [Fact] // I5
    public async Task I5_新增電話格式錯_400含phone繁中訊息()
    {
        var resp = await Client().PostAsJsonAsync(BaseUrl, ValidPayload(phone: "12345"), Json);
        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);

        var text = await resp.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(text);
        var errors = doc.RootElement.GetProperty("errors");
        Assert.True(errors.TryGetProperty("phone", out var phoneErrors));
        Assert.Contains("09", phoneErrors[0].GetString());
    }

    // ── I6：POST 身分證證號錯 ────────────────────────────────────
    [Fact] // I6
    public async Task I6_新增身分證證號錯_400含nationalId()
    {
        var payload = new
        {
            name = "測試", gender = "男", birthDate = "1990-01-01", idType = "身分證",
            nationalId = "A12345678",   // 缺一碼
            phone = "0912345678", email = "",
            residenceCounty = "臺東縣", residenceTownship = "臺東市", residenceAddress = "某路1號",
            groupName = "搶救組", positionCode = "member", qualifications = new[] { "防災士" },
            status = "在職", note = ""
        };

        var resp = await Client().PostAsJsonAsync(BaseUrl, payload, Json);
        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);

        var text = await resp.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(text);
        var errors = doc.RootElement.GetProperty("errors");
        Assert.True(errors.TryGetProperty("nationalId", out _));
    }

    // ── I7：POST body 帶 id/updatedAt 被忽略 ─────────────────────
    [Fact] // I7
    public async Task I7_新增body帶id與updatedAt_被忽略後端自產()
    {
        var payload = new
        {
            id = "M-777", updatedAt = "2000-01-01",   // 應被忽略
            name = "竄改測試", gender = "男", birthDate = "1990-01-01", idType = "身分證",
            nationalId = "A123456789", phone = "0912345678", email = "",
            residenceCounty = "臺東縣", residenceTownship = "臺東市", residenceAddress = "某路1號",
            groupName = "搶救組", positionCode = "member", qualifications = Array.Empty<string>(),
            status = "在職", note = ""
        };

        var resp = await Client().PostAsJsonAsync(BaseUrl, payload, Json);
        Assert.Equal(HttpStatusCode.Created, resp.StatusCode);

        var created = (await ReadModelResult<MemberResult>(resp))!.Data!;
        Assert.NotEqual("M-777", created.Id);                       // id 後端自產
        Assert.Equal(DateOnly.FromDateTime(DateTime.Now), created.UpdatedAt);  // updatedAt 後端自產
    }

    // ── I8：PUT 合法 ─────────────────────────────────────────────
    [Fact] // I8
    public async Task I8_更新合法_200欄位更新且updatedAt刷新()
    {
        var client = Client();

        // 先新增一筆供更新
        var created = (await ReadModelResult<MemberResult>(
            await client.PostAsJsonAsync(BaseUrl, ValidPayload(email: "put@example.tw", nationalId: "A210000008"), Json)))!.Data!;

        var updatePayload = new
        {
            name = "已更新姓名", gender = "男", birthDate = "1985-05-05", idType = "身分證",
            nationalId = "A220000008", phone = "0900000000", email = "updated@example.tw",
            residenceCounty = "花蓮縣", residenceTownship = "花蓮市", residenceAddress = "新路9號",
            groupName = "後勤組", positionCode = "leader", qualifications = new[] { "TCERT", "防災士" },
            status = "停用", note = "已更新"
        };

        var resp = await client.PutAsJsonAsync($"{BaseUrl}/{created.Id}", updatePayload, Json);
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);

        var updated = (await ReadModelResult<MemberResult>(resp))!.Data!;
        Assert.Equal(created.Id, updated.Id);          // id 不變
        Assert.Equal("已更新姓名", updated.Name);
        Assert.Equal("停用", updated.Status);
        Assert.Equal(["TCERT", "防災士"], updated.Qualifications);
        Assert.Equal(DateOnly.FromDateTime(DateTime.Now), updated.UpdatedAt);  // updatedAt 刷新
    }

    // ── I9：PUT 不存在 ───────────────────────────────────────────
    [Fact] // I9
    public async Task I9_更新不存在_404()
    {
        var resp = await Client().PutAsJsonAsync($"{BaseUrl}/M-999", ValidPayload(), Json);
        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);

        var body = await ReadModelResult<MemberResult>(resp);
        Assert.False(body!.Success);
        Assert.Contains("找不到", body.Message);
    }

    // ── I10：DELETE 存在 ─────────────────────────────────────────
    [Fact] // I10
    public async Task I10_刪除存在_204再GET回404()
    {
        var client = Client();
        var created = (await ReadModelResult<MemberResult>(
            await client.PostAsJsonAsync(BaseUrl, ValidPayload(email: "del@example.tw", nationalId: "A210000010"), Json)))!.Data!;

        var del = await client.DeleteAsync($"{BaseUrl}/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, del.StatusCode);

        var get = await client.GetAsync($"{BaseUrl}/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, get.StatusCode);
    }

    // ── I11：DELETE 不存在 ───────────────────────────────────────
    [Fact] // I11
    public async Task I11_刪除不存在_404()
    {
        var resp = await Client().DeleteAsync($"{BaseUrl}/M-999");
        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);

        var body = await ReadModelResult<object>(resp);
        Assert.False(body!.Success);
        Assert.Contains("找不到", body.Message);
    }

    // ── I12：qualifications 陣列 round-trip ──────────────────────
    [Fact] // I12
    public async Task I12_qualifications陣列_POST後GET一致()
    {
        var client = Client();
        var quals = new[] { "防災士", "急救證照", "無線電執照" };
        var payload = new
        {
            name = "資格測試", gender = "女", birthDate = "1990-01-01", idType = "身分證",
            nationalId = "A210000012", phone = "0912345678", email = "",
            residenceCounty = "臺東縣", residenceTownship = "臺東市", residenceAddress = "某路1號",
            groupName = "搶救組", positionCode = "member", qualifications = quals,
            status = "在職", note = ""
        };

        var created = (await ReadModelResult<MemberResult>(
            await client.PostAsJsonAsync(BaseUrl, payload, Json)))!.Data!;

        var fetched = (await ReadModelResult<MemberResult>(
            await client.GetAsync($"{BaseUrl}/{created.Id}")))!.Data!;

        Assert.Equal(quals, fetched.Qualifications);
    }

    // ── I13：啟動遷移 + 冪等 seed ────────────────────────────────
    [Fact] // I13
    public async Task I13_冪等seed_24筆種子存在且再次seed不增筆數()
    {
        using var scope = fixture.Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // 24 筆種子皆存在（遷移 + seed 成功）
        for (var i = 1; i <= 24; i++)
        {
            var id = $"M-{i:D3}";
            Assert.True(await db.Members.AnyAsync(m => m.Id == id), $"缺少種子 {id}");
        }

        // 冪等：表非空 → 再次 seed 不增筆數
        var before = await db.Members.CountAsync();
        DbSeeder.Seed(db);
        var after = await db.Members.CountAsync();
        Assert.Equal(before, after);
    }

    // ── I14：觸發未攔截例外 → 500 ProblemDetails ─────────────────
    [Fact] // I14
    public async Task I14_未攔截例外_500含traceId且不洩漏內部()
    {
        // 以會拋例外的假 Service 取代真實 Service，驗證 GlobalExceptionHandler（D11：未預期例外上拋）
        var factory = fixture.Factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureTestServices(services =>
            {
                var descriptor = services.Single(d => d.ServiceType == typeof(IMemberService));
                services.Remove(descriptor);
                services.AddScoped<IMemberService, ThrowingMemberService>();
            });
        });

        var resp = await factory.CreateClient().GetAsync(BaseUrl);
        Assert.Equal(HttpStatusCode.InternalServerError, resp.StatusCode);

        var text = await resp.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(text);
        Assert.True(doc.RootElement.TryGetProperty("traceId", out _));   // 含 traceId
        Assert.DoesNotContain("刻意觸發", text);                          // 不洩漏 ex.Message
        Assert.DoesNotContain("StackTrace", text, StringComparison.OrdinalIgnoreCase);
    }

    // ── I15：POST 省略 birthDate（value type 必填漏洞回歸測試）───
    [Fact] // I15
    public async Task I15_POST省略birthDate_400含欄位錯誤()
    {
        // 手刻 JSON：完全不含 birthDate 鍵，模擬前端漏帶欄位。
        // 修正前 BirthDate 為 DateOnly（value type）：[Required] 對省略欄位無效，
        // 會默默繫結為 0001-01-01 而通過驗證；修正後 BirthDate 為 DateOnly?，省略時繫結為 null，
        // [Required] 才能真正攔下（回歸測試）。
        const string json = """
            {
              "name": "缺生日測試",
              "gender": "女",
              "idType": "身分證",
              "nationalId": "A223456789",
              "phone": "0912345678",
              "email": "",
              "residenceCounty": "臺東縣",
              "residenceTownship": "臺東市",
              "residenceAddress": "某路1號",
              "groupName": "搶救組",
              "positionCode": "member",
              "qualifications": ["防災士"],
              "status": "在職",
              "note": ""
            }
            """;

        var resp = await Client().PostAsync(
            BaseUrl, new StringContent(json, Encoding.UTF8, "application/json"));
        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);

        var text = await resp.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(text);
        var errors = doc.RootElement.GetProperty("errors");
        Assert.True(errors.TryGetProperty("birthDate", out _));
    }

    // ── IB1：POST 含血型 → 201 且 GET 回傳血型（Contract v2 round-trip）──
    [Fact] // IB1
    public async Task IB1_新增含血型_201且GET回傳血型()
    {
        var client = Client();
        var payload = new
        {
            name = "血型測試", gender = "女", birthDate = "1990-01-01", idType = "身分證",
            nationalId = "A211000001", phone = "0912345678", email = "",
            residenceCounty = "臺東縣", residenceTownship = "臺東市", residenceAddress = "某路1號",
            groupName = "搶救組", positionCode = "member", qualifications = new[] { "防災士" },
            status = "在職", note = "", bloodType = "AB"
        };

        var created = (await ReadModelResult<MemberResult>(
            await client.PostAsJsonAsync(BaseUrl, payload, Json)))!.Data!;
        Assert.Equal("AB", created.BloodType);

        var fetched = (await ReadModelResult<MemberResult>(
            await client.GetAsync($"{BaseUrl}/{created.Id}")))!.Data!;
        Assert.Equal("AB", fetched.BloodType);
    }

    // ── IB2：POST 血型非法 → 400 且錯誤鍵為 camelCase「bloodType」──
    [Fact] // IB2
    public async Task IB2_新增血型非法_400且錯誤鍵為camelCase()
    {
        var payload = new
        {
            name = "血型非法", gender = "女", birthDate = "1990-01-01", idType = "身分證",
            nationalId = "A211000002", phone = "0912345678", email = "",
            residenceCounty = "臺東縣", residenceTownship = "臺東市", residenceAddress = "某路1號",
            groupName = "搶救組", positionCode = "member", qualifications = new[] { "防災士" },
            status = "在職", note = "", bloodType = "XYZ"
        };

        var resp = await Client().PostAsJsonAsync(BaseUrl, payload, Json);
        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);

        var text = await resp.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(text);
        var errors = doc.RootElement.GetProperty("errors");
        Assert.True(errors.TryGetProperty("bloodType", out _));   // camelCase 契約鍵
    }

    // ── IB3：POST 未帶血型 → 201 且血型為 null（選填相容 baseline 前端）──
    [Fact] // IB3
    public async Task IB3_新增未帶血型_201且血型為null()
    {
        // 手刻 JSON：完全不含 bloodType 鍵，模擬 baseline 前端不送此欄。
        const string json = """
            {
              "name": "無血型測試",
              "gender": "男",
              "birthDate": "1990-01-01",
              "idType": "身分證",
              "nationalId": "A211000003",
              "phone": "0912345678",
              "email": "",
              "residenceCounty": "臺東縣",
              "residenceTownship": "臺東市",
              "residenceAddress": "某路1號",
              "groupName": "搶救組",
              "positionCode": "member",
              "qualifications": ["防災士"],
              "status": "在職",
              "note": ""
            }
            """;

        var resp = await Client().PostAsync(
            BaseUrl, new StringContent(json, Encoding.UTF8, "application/json"));
        Assert.Equal(HttpStatusCode.Created, resp.StatusCode);

        var created = (await ReadModelResult<MemberResult>(resp))!.Data!;
        Assert.Null(created.BloodType);
    }

    /// <summary>I14 專用：所有方法直接拋例外，模擬未預期基礎設施故障。</summary>
    private sealed class ThrowingMemberService : IMemberService
    {
        public Task<ModelResult<List<MemberResult>>> GetAll() => throw new InvalidOperationException("刻意觸發的測試例外");
        public Task<ModelResult<MemberResult>> GetById(string id) => throw new InvalidOperationException("刻意觸發的測試例外");
        public Task<ModelResult<MemberResult>> Create(MemberRequest request) => throw new InvalidOperationException("刻意觸發的測試例外");
        public Task<ModelResult<MemberResult>> Update(string id, MemberRequest request) => throw new InvalidOperationException("刻意觸發的測試例外");
        public Task<ModelResult> Delete(string id) => throw new InvalidOperationException("刻意觸發的測試例外");
    }
}
