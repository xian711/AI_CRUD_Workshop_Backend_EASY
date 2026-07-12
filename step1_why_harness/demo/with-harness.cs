// ============================================================
//  有 harness：AI 照團隊規矩（CODE-RULES-api.md ＋ 契約）產出
//  同一句「幫我用 .NET 寫一個新增裝備的 API」
//  分層清楚、驗證嚴謹、狀態碼正確、例外不亂吞——像資深後端寫的
//  （教學展示：真專案會拆成 Models / Controllers / Services 三個檔）
// ============================================================
using System.ComponentModel.DataAnnotations;
using CrudTemplate.Api.Common;          // ModelResult 統一封裝
using CrudTemplate.Api.Constants;       // EquipmentEnums：分類清單、狀態清單、編碼字典
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EquipmentApi;

// ---------- 請求 DTO：DataAnnotations 宣告驗證，刻意不宣告 id/code/updatedAt ----------
public class EquipmentItemRequest
{
    [Required(ErrorMessage = "分類為必填")]
    [AllowedValues(EquipmentEnums.CategoryKeys, ErrorMessage = "分類不在允許清單內")]
    public string CategoryKey { get; set; } = string.Empty;

    [Required(ErrorMessage = "項目名稱為必填")]
    [StringLength(50, ErrorMessage = "名稱長度不可超過 50 字")]
    public string Name { get; set; } = string.Empty;

    [Range(0, int.MaxValue, ErrorMessage = "數量不可小於 0")]
    public int Qty { get; set; }

    [Required(ErrorMessage = "單位為必填")]
    public string Unit { get; set; } = string.Empty;

    [Required(ErrorMessage = "規格說明為必填")]
    public string Spec1 { get; set; } = string.Empty;

    [Required(ErrorMessage = "狀態為必填")]
    [AllowedValues("normal", "maintenance", "scrapped", ErrorMessage = "狀態只能是 normal / maintenance / scrapped")]
    public string Status { get; set; } = string.Empty;

    // 選填欄位：keeperPhone 填了才驗（手機 09 開頭 10 碼或市話）
    public string? Keeper { get; set; }
    [RegularExpression(@"^(09\d{8}|0\d{1,2}-?\d{6,8})$", ErrorMessage = "電話格式錯誤")]
    public string? KeeperPhone { get; set; }
    public string? LocationName { get; set; }
    public DateOnly? PurchaseDate { get; set; }
    public string? SpecNote { get; set; }
}

// ---------- Controller：薄委派，只負責「委派 Service → 依結果對映狀態碼」 ----------
[ApiController]
[Route("api/equipment/items")]
[Produces("application/json")]
public class EquipmentItemsController(IEquipmentItemService service) : ControllerBase
{
    /// <summary>新增裝備；成功回 201 + Location。驗證失敗由框架回 400（camelCase 錯誤鍵）。</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ModelResult<EquipmentItemResult>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] EquipmentItemRequest request)
    {
        var result = await service.Create(request);
        // 201 + Location 標頭指向新資源
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result);
    }

    /// <summary>取得單筆；不存在回 404。</summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var result = await service.GetById(id);
        return result.ToActionResult(StatusCodes.Status404NotFound);
    }
}

// ---------- Service：商業邏輯與資料存取，相依一律建構式注入 ----------
public class EquipmentItemService(AppDbContext db, EquipmentItemMapper mapper) : IEquipmentItemService
{
    public async Task<ModelResult<EquipmentItemResult>> Create(EquipmentItemRequest request)
    {
        var entity = mapper.ToEntity(request);

        // 在同一交易內產生 code：格式「前綴-流水3碼」，同前綴取現有最大流水號 +1
        // 交易 + 唯一索引 ux_equipment_item_code 一起擋住併發撞號
        await using var tx = await db.Database.BeginTransactionAsync();

        var prefix = EquipmentEnums.PrefixOf(request.CategoryKey, request.Name);
        var maxSeq = await db.EquipmentItems
            .Where(e => e.Code.StartsWith(prefix + "-"))
            .Select(e => e.Seq)
            .DefaultIfEmpty(0)
            .MaxAsync();
        entity.Code = $"{prefix}-{(maxSeq + 1):D3}";
        entity.UpdatedAt = DateOnly.FromDateTime(DateTime.Now);   // 本地時區，不用 UtcNow

        db.EquipmentItems.Add(entity);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return new ModelResult<EquipmentItemResult> { Data = mapper.ToResult(entity) };
    }

    public async Task<ModelResult<EquipmentItemResult>> GetById(string id)
    {
        var entity = await db.EquipmentItems.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        if (entity is null)
        {
            // 查無資料是「預期的業務失敗」：轉成 ModelResult 失敗（Controller 映 404）
            // 未預期例外（DB 斷線）不 try/catch，直接上拋給 GlobalExceptionHandler 回 500
            return new ModelResult<EquipmentItemResult> { Success = false, Message = $"找不到裝備 {id}" };
        }
        return new ModelResult<EquipmentItemResult> { Data = mapper.ToResult(entity) };
    }
}
