using CrudTemplate.Api.Common;
using CrudTemplate.Api.Models;

namespace CrudTemplate.Api.Services;

/// <summary>
/// 人員服務介面（CRUD 五方法）。建構子注入，利於替換與測試（NFR-B-06）。
/// </summary>
public interface IMemberService
{
    /// <summary>全量清單，id 升冪（FR-B-101/102）。</summary>
    Task<ModelResult<List<MemberResult>>> GetAll();

    /// <summary>單筆查詢；不存在時 Success=false（FR-B-201/202）。</summary>
    Task<ModelResult<MemberResult>> GetById(string id);

    /// <summary>新增；後端配 id（SEQUENCE）與 updatedAt（本地時區）（FR-B-301/302）。</summary>
    Task<ModelResult<MemberResult>> Create(MemberRequest request);

    /// <summary>全量更新；不存在時 Success=false（FR-B-401/403）。</summary>
    Task<ModelResult<MemberResult>> Update(string id, MemberRequest request);

    /// <summary>hard delete；不存在時 Success=false（FR-B-501/502）。</summary>
    Task<ModelResult> Delete(string id);
}
