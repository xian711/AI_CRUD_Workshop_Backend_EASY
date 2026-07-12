using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using CrudTemplate.Api.Common;
using CrudTemplate.Api.Models;

namespace CrudTemplate.Api.Tests.Integration;

/// <summary>
/// 裝備物資端到端整合測試（SDD-delta §9.3）。打 PostgreSQL 測試 DB，與 Members 共用同一 fixture / collection。
/// </summary>
[Collection("Api")]
public class EquipmentApiTests(DatabaseFixture fixture)
{
    private const string BaseUrl = "/api/equipment/items";

    private static readonly JsonSerializerOptions Json = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private HttpClient Client() => fixture.Factory.CreateClient();

    /// <summary>合法請求範本（各測試按需覆寫 categoryKey / name 等）。</summary>
    private static object ValidPayload(
        string categoryKey = "OTHER",
        string name = "測試品項",
        int qty = 5,
        string unit = "台",
        string spec1 = "測試規格",
        string? keeper = "測試員",
        string? keeperPhone = "0912345678",
        string? locationName = "測試倉庫",
        string status = "normal",
        string? purchaseDate = "2024-01-01",
        string? specNote = "備註") => new
    {
        categoryKey,
        name,
        qty,
        unit,
        spec1,
        keeper,
        keeperPhone,
        locationName,
        status,
        purchaseDate,
        specNote
    };

    private static async Task<ModelResult<T>?> ReadModelResult<T>(HttpResponseMessage resp)
    {
        var text = await resp.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<ModelResult<T>>(text, Json);
    }

    private static int SerialOf(string code)
    {
        var dash = code.LastIndexOf('-');
        return int.Parse(code[(dash + 1)..]);
    }

    // ── EI1：GET 清單 ≥24，含 E-001~E-024 且升冪 ──
    [Fact] // EI1
    public async Task EI1_取得清單_至少24筆含E001至E024且升冪()
    {
        var resp = await Client().GetAsync(BaseUrl);
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);

        var body = await ReadModelResult<List<EquipmentItemResult>>(resp);
        Assert.NotNull(body);
        Assert.True(body!.Success);
        var list = body.Data!;

        Assert.True(list.Count >= 24, $"期望至少 24 筆，實得 {list.Count}");
        for (var i = 1; i <= 24; i++)
            Assert.Contains(list, e => e.Id == $"E-{i:D3}");

        var ids = list.Select(e => e.Id).ToList();
        Assert.Equal(ids.OrderBy(x => x, StringComparer.Ordinal), ids);
    }

    // ── EI2：GET 單筆存在 → 200，code / name 相符 ──
    [Fact] // EI2
    public async Task EI2_取得單筆存在_200且欄位相符()
    {
        var resp = await Client().GetAsync($"{BaseUrl}/E-001");
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);

        var body = await ReadModelResult<EquipmentItemResult>(resp);
        Assert.True(body!.Success);
        Assert.Equal("E-001", body.Data!.Id);
        Assert.Equal("IT-LAP-001", body.Data.Code);
        Assert.Equal("筆記型電腦", body.Data.Name);
    }

    // ── EI3：GET 單筆不存在 → 404 繁中 ──
    [Fact] // EI3
    public async Task EI3_取得單筆不存在_404且繁中訊息()
    {
        var resp = await Client().GetAsync($"{BaseUrl}/E-999");
        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);

        var body = await ReadModelResult<EquipmentItemResult>(resp);
        Assert.False(body!.Success);
        Assert.Contains("找不到品項 E-999", body.Message);
    }

    // ── EI4：POST 合法 → 201 + Location，id 為 E-###（序號 ≥25，證明 SEQUENCE 起 25）+ updatedAt 今天 ──
    [Fact] // EI4
    public async Task EI4_新增合法_201且Location與自產id與今天updatedAt()
    {
        var client = Client();
        var before = await ReadModelResult<List<EquipmentItemResult>>(await client.GetAsync(BaseUrl));
        var existingIds = before!.Data!.Select(e => e.Id).ToHashSet();

        var resp = await client.PostAsJsonAsync(BaseUrl, ValidPayload(), Json);
        Assert.Equal(HttpStatusCode.Created, resp.StatusCode);
        Assert.NotNull(resp.Headers.Location);

        var created = (await ReadModelResult<EquipmentItemResult>(resp))!.Data!;
        Assert.Matches(@"^E-\d{3,}$", created.Id);
        Assert.DoesNotContain(created.Id, existingIds);
        // 序號 ≥25：種子 E-001~E-024 之後，SEQUENCE 起 25（不硬斷言 E-025，因共用 fixture 下寫入測試會推進序號）
        Assert.True(int.Parse(created.Id[2..]) >= 25, $"期望序號 ≥25，實得 {created.Id}");
        Assert.Equal(DateOnly.FromDateTime(DateTime.Now), created.UpdatedAt);
    }

    // ── EI5：POST 合法 → code 前綴依「類別碼-項目碼」正確產生 ──
    [Fact] // EI5
    public async Task EI5_新增_code前綴正確()
    {
        var resp = await Client().PostAsJsonAsync(
            BaseUrl, ValidPayload(categoryKey: "STORAGE", name: "除濕機"), Json);
        Assert.Equal(HttpStatusCode.Created, resp.StatusCode);

        var created = (await ReadModelResult<EquipmentItemResult>(resp))!.Data!;
        Assert.StartsWith("ST-DEH-", created.Code);
    }

    // ── EI6：POST 驗證失敗 → 400，錯誤鍵為 camelCase「keeperPhone」（非 PascalCase）──
    [Fact] // EI6
    public async Task EI6_新增驗證失敗_400且錯誤鍵為camelCase()
    {
        var resp = await Client().PostAsJsonAsync(
            BaseUrl, ValidPayload(keeperPhone: "123"), Json);
        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);

        var text = await resp.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(text);
        var errors = doc.RootElement.GetProperty("errors");
        Assert.True(errors.TryGetProperty("keeperPhone", out _));   // camelCase 契約鍵
        Assert.False(errors.TryGetProperty("KeeperPhone", out _));  // 非 PascalCase
    }

    // ── EI7：同前綴連續 POST → 流水遞增 ──
    [Fact] // EI7
    public async Task EI7_同前綴連續新增_流水遞增()
    {
        var client = Client();
        // ST-RAK-（貨架角鋼）無種子占用，兩筆連續新增流水應遞增 1
        var first = (await ReadModelResult<EquipmentItemResult>(
            await client.PostAsJsonAsync(BaseUrl, ValidPayload(categoryKey: "STORAGE", name: "貨架角鋼"), Json)))!.Data!;
        var second = (await ReadModelResult<EquipmentItemResult>(
            await client.PostAsJsonAsync(BaseUrl, ValidPayload(categoryKey: "STORAGE", name: "貨架角鋼"), Json)))!.Data!;

        Assert.StartsWith("ST-RAK-", first.Code);
        Assert.StartsWith("ST-RAK-", second.Code);
        Assert.Equal(SerialOf(first.Code) + 1, SerialOf(second.Code));
    }

    // ── EI8：POST「其他」分類自填品名 → code 用 OT-OTH- 前綴 ──
    [Fact] // EI8
    public async Task EI8_其他分類自填品名_codeUsesOTOTH()
    {
        var resp = await Client().PostAsJsonAsync(
            BaseUrl, ValidPayload(categoryKey: "OTHER", name: "自訂特殊設備"), Json);
        var created = (await ReadModelResult<EquipmentItemResult>(resp))!.Data!;
        Assert.StartsWith("OT-OTH-", created.Code);
    }

    // ── EI9：PUT 分類 / 項目不變 → 保留原 code，欄位更新，updatedAt 刷新 ──
    [Fact] // EI9
    public async Task EI9_更新分類不變_保留原code且欄位更新()
    {
        var client = Client();
        var created = (await ReadModelResult<EquipmentItemResult>(
            await client.PostAsJsonAsync(BaseUrl, ValidPayload(categoryKey: "ICT", name: "平板電腦"), Json)))!.Data!;
        var originalCode = created.Code;

        var updatePayload = ValidPayload(
            categoryKey: "ICT", name: "平板電腦", qty: 99, unit: "組", spec1: "已更新規格", status: "maintenance");
        var resp = await client.PutAsJsonAsync($"{BaseUrl}/{created.Id}", updatePayload, Json);
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);

        var updated = (await ReadModelResult<EquipmentItemResult>(resp))!.Data!;
        Assert.Equal(created.Id, updated.Id);
        Assert.Equal(originalCode, updated.Code);          // 分類 / 項目未變 → code 保留
        Assert.Equal(99, updated.Qty);
        Assert.Equal("maintenance", updated.Status);
        Assert.Equal(DateOnly.FromDateTime(DateTime.Now), updated.UpdatedAt);
    }

    // ── EI10：PUT 分類 / 項目改變 → code 於新前綴重算 ──
    [Fact] // EI10
    public async Task EI10_更新分類改變_code重算()
    {
        var client = Client();
        var created = (await ReadModelResult<EquipmentItemResult>(
            await client.PostAsJsonAsync(BaseUrl, ValidPayload(categoryKey: "ICT", name: "平板電腦"), Json)))!.Data!;
        var originalCode = created.Code;

        var updatePayload = ValidPayload(categoryKey: "POWER", name: "發電機");
        var resp = await client.PutAsJsonAsync($"{BaseUrl}/{created.Id}", updatePayload, Json);
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);

        var updated = (await ReadModelResult<EquipmentItemResult>(resp))!.Data!;
        Assert.NotEqual(originalCode, updated.Code);
        Assert.StartsWith("PW-GEN-", updated.Code);
    }

    // ── EI11：PUT 不存在 → 404 ──
    [Fact] // EI11
    public async Task EI11_更新不存在_404()
    {
        var resp = await Client().PutAsJsonAsync($"{BaseUrl}/E-999", ValidPayload(), Json);
        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);

        var body = await ReadModelResult<EquipmentItemResult>(resp);
        Assert.False(body!.Success);
        Assert.Contains("找不到", body.Message);
    }

    // ── EI12：DELETE 存在 → 204，再 GET → 404 ──
    [Fact] // EI12
    public async Task EI12_刪除存在_204再GET回404()
    {
        var client = Client();
        var created = (await ReadModelResult<EquipmentItemResult>(
            await client.PostAsJsonAsync(BaseUrl, ValidPayload(categoryKey: "OFFICE", name: "摺疊推車"), Json)))!.Data!;

        var del = await client.DeleteAsync($"{BaseUrl}/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, del.StatusCode);

        var get = await client.GetAsync($"{BaseUrl}/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, get.StatusCode);
    }

    // ── EI13：DELETE 不存在 → 404 ──
    [Fact] // EI13
    public async Task EI13_刪除不存在_404()
    {
        var resp = await Client().DeleteAsync($"{BaseUrl}/E-999");
        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);

        var body = await ReadModelResult<object>(resp);
        Assert.False(body!.Success);
        Assert.Contains("找不到", body.Message);
    }

    // ── EI14：POST body 帶 id/code → 被忽略，後端自產 ──
    [Fact] // EI14
    public async Task EI14_新增body帶id與code_被忽略後端自產()
    {
        var payload = new
        {
            id = "E-777", code = "XX-YYY-999",   // 應被忽略
            categoryKey = "MEDICAL", name = "急救箱", qty = 2, unit = "箱",
            spec1 = "測試", keeper = (string?)null, keeperPhone = (string?)null,
            locationName = (string?)null, status = "normal",
            purchaseDate = (string?)null, specNote = (string?)null
        };

        var resp = await Client().PostAsJsonAsync(BaseUrl, payload, Json);
        Assert.Equal(HttpStatusCode.Created, resp.StatusCode);

        var created = (await ReadModelResult<EquipmentItemResult>(resp))!.Data!;
        Assert.NotEqual("E-777", created.Id);          // id 後端自產
        Assert.NotEqual("XX-YYY-999", created.Code);   // code 後端自產
        Assert.StartsWith("MD-FAK-", created.Code);
    }
}
