using System.Data;
using CrudTemplate.Api.Common;
using CrudTemplate.Api.Constants;
using CrudTemplate.Api.Data;
using CrudTemplate.Api.Mapping;
using CrudTemplate.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace CrudTemplate.Api.Services;

/// <summary>
/// 裝備物資服務。商業邏輯層（DESIGN-delta §2 / §7）。
/// </summary>
/// <remarks>
/// 例外分類（沿用範本 D11）：只把「預期的業務失敗」（查無資料）轉成 <see cref="ModelResult"/> 失敗；
/// 未預期例外（DB 斷線、唯一索引碰撞等）不捕捉、直接上拋給 GlobalExceptionHandler 回 500——
/// 不做 blanket try/catch。
/// <para>
/// 編碼取號（SCOPE Q1）：<c>Code</c> = <c>{類別碼}-{項目碼}-{流水3碼}</c>，同前綴掃現有最大流水 +1；
/// 與 id 取號（SEQUENCE）在同一交易內完成，唯一索引 <c>ux_equipment_item_code</c> 為最後防線。
/// 「同前綴 MAX+1」在真併發下仍可能撞號（教學前提為單寫入者，記入 DESIGN-delta 限制）。
/// </para>
/// </remarks>
public class EquipmentService(
    AppDbContext db,
    EquipmentMapper mapper) : IEquipmentService
{
    public async Task<ModelResult<List<EquipmentItemResult>>> GetAll()
    {
        // id 升冪，確保順序決定性（分頁 / 篩選 / 排序在前端做，API 回全量，SCOPE Q5）
        var entities = await db.EquipmentItems
            .AsNoTracking()
            .OrderBy(e => e.Id)
            .ToListAsync();

        return new ModelResult<List<EquipmentItemResult>>
        {
            Data = entities.Select(mapper.ToResult).ToList()
        };
    }

    public async Task<ModelResult<EquipmentItemResult>> GetById(string id)
    {
        var entity = await db.EquipmentItems.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        if (entity is null)
        {
            return NotFound(id);
        }

        return new ModelResult<EquipmentItemResult> { Data = mapper.ToResult(entity) };
    }

    public async Task<ModelResult<EquipmentItemResult>> Create(EquipmentItemRequest request)
    {
        var entity = mapper.ToEntity(request);

        // id（SEQUENCE）與 code（同前綴 MAX+1）在同一交易內取號，確保原子性
        await using var tx = await db.Database.BeginTransactionAsync();

        var next = await NextSequenceValueAsync();
        entity.Id = $"E-{next:D3}";
        entity.Code = await NextCodeAsync(EquipmentEnums.CodePrefixOf(request.CategoryKey, request.Name));
        // 本地時區手工組日期，嚴禁 UtcNow（沿用範本 D12）
        entity.UpdatedAt = DateOnly.FromDateTime(DateTime.Now);

        db.EquipmentItems.Add(entity);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return new ModelResult<EquipmentItemResult> { Data = mapper.ToResult(entity) };
    }

    public async Task<ModelResult<EquipmentItemResult>> Update(string id, EquipmentItemRequest request)
    {
        var entity = await db.EquipmentItems.FirstOrDefaultAsync(e => e.Id == id);
        if (entity is null)
        {
            // PUT 不做 upsert，不存在為預期業務失敗
            return NotFound(id);
        }

        // 編輯保留原 code；分類 / 項目改動則於新前綴重算（對齊前端 keepCode 邏輯）。
        // 重算需掃現有最大流水，故整段包在交易內，與寫入同一語意。
        await using var tx = await db.Database.BeginTransactionAsync();

        var newPrefix = EquipmentEnums.CodePrefixOf(request.CategoryKey, request.Name);
        var keepCode = entity.Code.StartsWith(newPrefix, StringComparison.Ordinal);
        var nextCode = keepCode ? entity.Code : await NextCodeAsync(newPrefix);

        // 全量更新（除 id 外覆蓋所有欄位）；Mapperly 忽略 Id/Code/UpdatedAt
        mapper.Apply(request, entity);
        entity.Code = nextCode;
        entity.UpdatedAt = DateOnly.FromDateTime(DateTime.Now);

        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return new ModelResult<EquipmentItemResult> { Data = mapper.ToResult(entity) };
    }

    public async Task<ModelResult> Delete(string id)
    {
        var entity = await db.EquipmentItems.FirstOrDefaultAsync(e => e.Id == id);
        if (entity is null)
        {
            return new ModelResult { Success = false, Message = $"找不到品項 {id}" };
        }

        db.EquipmentItems.Remove(entity);   // hard delete（SCOPE Q4）
        await db.SaveChangesAsync();
        return new ModelResult();
    }

    /// <summary>組「查無資料」失敗結果（繁中訊息，Controller 映射 404）。</summary>
    private static ModelResult<EquipmentItemResult> NotFound(string id) =>
        new() { Success = false, Message = $"找不到品項 {id}" };

    /// <summary>
    /// 依前綴取下一個可用品項編碼（同前綴 <c>{prefix}{流水3碼}</c>，MAX+1）。
    /// </summary>
    /// <remarks>
    /// 掃現有同前綴 code 的最大流水 +1。應於交易內呼叫，讀已提交資料；
    /// 單寫入者前提下無競態，唯一索引為最後防線（DESIGN-delta §7）。
    /// </remarks>
    private async Task<string> NextCodeAsync(string prefix)
    {
        var existing = await db.EquipmentItems
            .Where(e => e.Code.StartsWith(prefix))
            .Select(e => e.Code)
            .ToListAsync();

        var maxSeq = existing
            .Select(code => int.TryParse(code[prefix.Length..], out var seq) ? seq : 0)
            .DefaultIfEmpty(0)
            .Max();

        return $"{prefix}{maxSeq + 1:D3}";
    }

    /// <summary>取 SEQUENCE 下一值（沿用範本作法）。</summary>
    private async Task<int> NextSequenceValueAsync()
    {
        var conn = db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open)
            await conn.OpenAsync();

        await using var cmd = conn.CreateCommand();
        cmd.CommandText = $"SELECT nextval('{AppDbContext.EquipmentSequenceName}')";
        cmd.Transaction = db.Database.CurrentTransaction?.GetDbTransaction();

        var scalar = await cmd.ExecuteScalarAsync();
        return Convert.ToInt32(scalar);
    }
}
