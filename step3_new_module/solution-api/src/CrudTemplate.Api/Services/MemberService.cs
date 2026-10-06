using System.Data;
using CrudTemplate.Api.Common;
using CrudTemplate.Api.Data;
using CrudTemplate.Api.Mapping;
using CrudTemplate.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace CrudTemplate.Api.Services;

/// <summary>
/// 人員服務。商業邏輯層（DESIGN §2 / §7）。
/// </summary>
/// <remarks>
/// 例外分類（D11）：只把「預期的業務失敗」（查無資料）轉成 <see cref="ModelResult"/> 失敗；
/// 未預期例外（DB 斷線等）不捕捉、直接上拋給 GlobalExceptionHandler 回 500——
/// blanket try/catch 會讓基礎設施故障被 failureStatusCode 誤映成 404。
/// JWT 接縫：未來導入認證後由 Controller 傳入 ClaimsPrincipal 供稽核/授權（FR-B-702，本版不啟用）。
/// </remarks>
public class MemberService(
    AppDbContext db,
    MemberMapper mapper) : IMemberService
{
    public async Task<ModelResult<List<MemberResult>>> GetAll()
    {
        // FR-B-102：id 升冪，確保順序決定性
        var entities = await db.Members
            .AsNoTracking()
            .OrderBy(m => m.Id)
            .ToListAsync();

        return new ModelResult<List<MemberResult>>
        {
            Data = entities.Select(mapper.ToResult).ToList()
        };
    }

    public async Task<ModelResult<MemberResult>> GetById(string id)
    {
        var entity = await db.Members.AsNoTracking().FirstOrDefaultAsync(m => m.Id == id);
        if (entity is null)
        {
            // FR-B-202：查無資料為預期業務失敗，Success=false，繁中訊息（Controller 映射 404）
            return NotFound(id);
        }

        return new ModelResult<MemberResult> { Data = mapper.ToResult(entity) };
    }

    public async Task<ModelResult<MemberResult>> Create(MemberRequest request)
    {
        var entity = mapper.ToEntity(request);

        // BR-B-07：交易內取 SEQUENCE 下一值，格式化為 M-###
        // SEQUENCE 保證唯一且遞增，但允許缺號——rollback、失敗與快取都會消耗號碼且不退回，
        // 號碼不代表提交順序（取代前端掃最大值+1 的競態）。
        await using var tx = await db.Database.BeginTransactionAsync();

        var next = await NextSequenceValueAsync();
        entity.Id = $"M-{next:D3}";
        // BR-B-08：本地時區手工組日期，嚴禁 UtcNow（DateOnly 無時區概念，序列化即 yyyy-MM-dd）
        entity.UpdatedAt = DateOnly.FromDateTime(DateTime.Now);

        db.Members.Add(entity);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return new ModelResult<MemberResult> { Data = mapper.ToResult(entity) };
    }

    public async Task<ModelResult<MemberResult>> Update(string id, MemberRequest request)
    {
        var entity = await db.Members.FirstOrDefaultAsync(m => m.Id == id);
        if (entity is null)
        {
            // FR-B-403：PUT 不做 upsert，不存在為預期業務失敗（D9）
            return NotFound(id);
        }

        // 全量更新（除 id 外覆蓋所有欄位）；Mapperly 忽略 Id/UpdatedAt（BR-B-06）
        mapper.Apply(request, entity);
        // BR-B-08：刷新 updatedAt（本地時區）
        entity.UpdatedAt = DateOnly.FromDateTime(DateTime.Now);

        await db.SaveChangesAsync();
        return new ModelResult<MemberResult> { Data = mapper.ToResult(entity) };
    }

    public async Task<ModelResult> Delete(string id)
    {
        var entity = await db.Members.FirstOrDefaultAsync(m => m.Id == id);
        if (entity is null)
        {
            // FR-B-502：不存在為預期業務失敗
            return new ModelResult { Success = false, Message = $"找不到人員 {id}" };
        }

        db.Members.Remove(entity);   // BR-B-04：hard delete
        await db.SaveChangesAsync();
        return new ModelResult();
    }

    /// <summary>組「查無資料」失敗結果（繁中訊息，Controller 映射 404）。</summary>
    private static ModelResult<MemberResult> NotFound(string id) =>
        new() { Success = false, Message = $"找不到人員 {id}" };

    /// <summary>取 SEQUENCE 下一值（DESIGN §4.2）。</summary>
    /// <remarks>
    /// 以原生 DbCommand 執行 PostgreSQL 的 <c>nextval('seq')</c>（回傳 bigint，以
    /// <c>Convert.ToInt32</c> 收斂為 int），並掛入目前交易，確保取號與寫入同一交易語意。
    /// </remarks>
    private async Task<int> NextSequenceValueAsync()
    {
        var conn = db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open)
            await conn.OpenAsync();

        await using var cmd = conn.CreateCommand();
        cmd.CommandText = $"SELECT nextval('{AppDbContext.MemberSequenceName}')";
        cmd.Transaction = db.Database.CurrentTransaction?.GetDbTransaction();

        var scalar = await cmd.ExecuteScalarAsync();
        return Convert.ToInt32(scalar);
    }
}
