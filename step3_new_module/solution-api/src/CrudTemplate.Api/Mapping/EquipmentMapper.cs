using CrudTemplate.Api.Entities;
using CrudTemplate.Api.Models;
using Riok.Mapperly.Abstractions;

namespace CrudTemplate.Api.Mapping;

/// <summary>
/// 裝備物資映射設定（Mapperly source generator，映射碼於編譯期產生，SDD-delta §6）。
/// </summary>
/// <remarks>
/// <c>RequiredMappingStrategy.Target</c>：目標有欄位未被映射 → 編譯期警告（csproj 設為錯誤）。
/// Id / Code / UpdatedAt 由服務層設值，故映射時忽略（仿範本 BR-B-06）。
/// </remarks>
[Mapper(RequiredMappingStrategy = RequiredMappingStrategy.Target)]
public partial class EquipmentMapper
{
    /// <summary>Request → 新 Entity；Id / Code / UpdatedAt 由服務層設值，故忽略。</summary>
    [MapperIgnoreTarget(nameof(EquipmentItem.Id))]
    [MapperIgnoreTarget(nameof(EquipmentItem.Code))]
    [MapperIgnoreTarget(nameof(EquipmentItem.UpdatedAt))]
    public partial EquipmentItem ToEntity(EquipmentItemRequest req);

    /// <summary>Request → 既有 Entity（更新用）；同樣忽略 Id / Code / UpdatedAt。</summary>
    [MapperIgnoreTarget(nameof(EquipmentItem.Id))]
    [MapperIgnoreTarget(nameof(EquipmentItem.Code))]
    [MapperIgnoreTarget(nameof(EquipmentItem.UpdatedAt))]
    public partial void Apply(EquipmentItemRequest req, EquipmentItem entity);

    /// <summary>Entity → 回應 Result。</summary>
    public partial EquipmentItemResult ToResult(EquipmentItem entity);

    /// <summary>
    /// Qty：int? → int 手寫轉換（Mapperly 依型別自動採用此方法）。
    /// [Required] 已保證 Validate 通過時必有值，故 .Value 安全；同時避免 nullable→non-nullable 的 RMG 警告。
    /// </summary>
    private static int MapQty(int? source) => source!.Value;
}
