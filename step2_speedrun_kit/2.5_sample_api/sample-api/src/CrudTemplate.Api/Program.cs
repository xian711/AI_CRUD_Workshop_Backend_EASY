using System.Text.Json;
using CrudTemplate.Api.Common;
using CrudTemplate.Api.Data;
using CrudTemplate.Api.Mapping;
using CrudTemplate.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ── 資料層：PostgreSQL（D2）。連線字串可被環境變數覆蓋（NFR-B-09） ──
// 環境變數覆蓋範例：ConnectionStrings__Default=...（雙底線對應 ConnectionStrings:Default）
var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? throw new InvalidOperationException(
        "缺少連線字串 ConnectionStrings:Default（見 appsettings.Development.json 或環境變數）");
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

// ── Mapperly 映射器：編譯期產生、無狀態，以 singleton 註冊（SDD §6） ──
builder.Services.AddSingleton<MemberMapper>();

// ── 服務註冊（建構子注入，NFR-B-06） ──
builder.Services.AddScoped<IMemberService, MemberService>();

// ── 全域例外處理 + ProblemDetails（NFR-B-04，D11 未預期例外由此回 500） ──
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// ── 認證/授權接縫（本版空殼，無 JWT；FR-B-702） ──
builder.Services.AddAuthentication();
builder.Services.AddAuthorization();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// ── 驗證失敗（400）錯誤鍵改為 camelCase，對齊前端契約（D1 / SDD §3.4） ──
// 預設 ValidationProblemDetails 的 errors 鍵為 CLR 屬性名（PascalCase），此處統一轉 camelCase。
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(kvp => kvp.Value?.Errors.Count > 0)
            .ToDictionary(
                kvp => JsonNamingPolicy.CamelCase.ConvertName(kvp.Key),
                kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray());

        var problem = new ValidationProblemDetails(errors)
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
            Title = "One or more validation errors occurred.",
            Status = StatusCodes.Status400BadRequest
        };
        problem.Extensions["traceId"] = context.HttpContext.TraceIdentifier;

        return new BadRequestObjectResult(problem)
        {
            ContentTypes = { "application/problem+json" }
        };
    };
});

// ── Swagger/OpenAPI（僅 Development 啟用，方便課堂 demo） ──
builder.Services.AddSwaggerGen(options =>
{
    var xmlPath = Path.Combine(AppContext.BaseDirectory, "CrudTemplate.Api.xml");
    if (File.Exists(xmlPath))
        options.IncludeXmlComments(xmlPath);
});

var app = builder.Build();

// ── 啟動：套用 Migrations（NFR-B-01）＋ 冪等 seed（NFR-B-02） ──
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    DbSeeder.Seed(db);
}

// ── Middleware 順序（顯式固定，沿用原單位範本，SDD §7） ──
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();   // 接縫：本版無 scheme，為 no-op
app.UseAuthorization();
app.MapControllers();

app.Run();

/// <summary>供 WebApplicationFactory 整合測試參考的進入點。</summary>
public partial class Program;
