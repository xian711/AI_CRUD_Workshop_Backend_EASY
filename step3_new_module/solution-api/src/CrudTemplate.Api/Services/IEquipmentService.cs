using CrudTemplate.Api.Common;
using CrudTemplate.Api.Models;

namespace CrudTemplate.Api.Services;

/// <summary>
/// 裝備物資服務介面（CRUD 五方法）。建構子注入，利於替換與測試（沿用範本 NFR-B-06）。
/// </summary>
public interface IEquipmentService
{
    /// <summary>全量清單，id 升冪。</summary>
    Task<ModelResult<List<EquipmentItemResult>>> GetAll();

    /// <summary>單筆查詢；不存在時 Success=false。</summary>
    Task<ModelResult<EquipmentItemResult>> GetById(string id);

    /// <summary>新增；後端配 id（SEQUENCE）、code（同前綴 MAX+1）與 updatedAt（本地時區）。</summary>
    Task<ModelResult<EquipmentItemResult>> Create(EquipmentItemRequest request);

    /// <summary>全量更新；分類 / 項目未變則保留原 code，變了就重算；不存在時 Success=false。</summary>
    Task<ModelResult<EquipmentItemResult>> Update(string id, EquipmentItemRequest request);

    /// <summary>hard delete；不存在時 Success=false。</summary>
    Task<ModelResult> Delete(string id);
}
