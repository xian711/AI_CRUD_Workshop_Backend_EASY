// ============================================================
//  沒有 harness：只給一句話，AI 自由發揮的產出
//  實跑日期 2026-08-19｜模型 Claude Opus 5｜prompt 見 PROMPT.md 版本 A
//  注意：它做得又快又整齊——分層、注入、EF Core、DTO 驗證、201+Location 全都對。
//  問題不在「醜」，在於**每一個決定都是它自己做的**，跟你們團隊的規矩無關。
//  （教學展示：真專案會拆成多個檔，這裡併成一份方便並排看）
// ============================================================
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EquipmentApi;

// ---------- 它自己決定的請求 DTO ----------
public record CreateEquipmentRequest(
    [property: Required(ErrorMessage = "Category is required")]
    [property: StringLength(50)] string Category,

    [property: Required(ErrorMessage = "Name is required")]
    [property: StringLength(100)] string Name,

    [property: Range(0, int.MaxValue, ErrorMessage = "Quantity must be >= 0")]
    int Quantity,

    [property: Required][property: StringLength(20)] string Unit,
    [property: StringLength(200)] string? Specification,
    [property: StringLength(50)] string? Keeper,
    [property: EnumDataType(typeof(EquipmentStatus))] EquipmentStatus Status
);

// ---------- 它自己決定的回應形狀 ----------
public record EquipmentResponse(
    Guid Id, string Category, string Name, int Quantity,
    string Unit, string? Specification, string? Keeper,
    string Status, DateTimeOffset CreatedAt);

public enum EquipmentStatus { Normal, Maintenance, Scrapped }

// ---------- Controller：薄委派、注入相依，這些它自己就做對了 ----------
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class EquipmentController(IEquipmentService service) : ControllerBase
{
    /// <summary>新增一筆裝備</summary>
    [HttpPost]
    [ProducesResponseType(typeof(EquipmentResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<EquipmentResponse>> Create(
        [FromBody] CreateEquipmentRequest request, CancellationToken ct)
    {
        var created = await service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // 需求沒有要「查單筆」，它自己加了一個端點
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EquipmentResponse>> GetById(Guid id, CancellationToken ct)
        => throw new NotImplementedException();
}

// ---------- Service：商業邏輯與資料存取，分層也對 ----------
public class EquipmentService(AppDbContext db) : IEquipmentService
{
    public async Task<EquipmentResponse> CreateAsync(CreateEquipmentRequest req, CancellationToken ct)
    {
        var entity = new Equipment
        {
            Id = Guid.NewGuid(),
            Category = req.Category,
            Name = req.Name,
            Quantity = req.Quantity,
            Unit = req.Unit,
            Specification = req.Specification,
            Keeper = req.Keeper,
            Status = req.Status
        };

        db.Equipments.Add(entity);
        await db.SaveChangesAsync(ct);          // EF Core 參數化，沒有 SQL 拼接

        return new EquipmentResponse(entity.Id, entity.Category, entity.Name,
            entity.Quantity, entity.Unit, entity.Specification, entity.Keeper,
            entity.Status.ToString(), entity.CreatedAt);
    }
}

// ---------- Program.cs：DI、連線字串走設定檔、全域例外處理，全部自己做對 ----------
// builder.Services.AddDbContext<AppDbContext>(o =>
//     o.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
// builder.Services.AddScoped<IEquipmentService, EquipmentService>();
// builder.Services.AddProblemDetails();
// builder.Services.AddExceptionHandler<GlobalExceptionHandler>();   // 沒有 blanket try/catch
// builder.Services.AddSwaggerGen();                                 // 它自己加的
