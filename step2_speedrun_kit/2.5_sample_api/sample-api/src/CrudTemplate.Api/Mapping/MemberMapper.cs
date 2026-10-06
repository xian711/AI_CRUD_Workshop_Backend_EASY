using CrudTemplate.Api.Entities;
using CrudTemplate.Api.Models;
using Riok.Mapperly.Abstractions;

namespace CrudTemplate.Api.Mapping;

/// <summary>
/// 人員映射設定（Mapperly source generator，映射碼於編譯期產生，DESIGN §6）。
/// </summary>
/// <remarks>
/// <c>RequiredMappingStrategy.Target</c>：目標有欄位未被映射 → 編譯期警告（本範本設為錯誤，見 csproj）。
/// id / updatedAt 由服務層設值，故映射時忽略（BR-B-06）。
/// </remarks>
[Mapper(RequiredMappingStrategy = RequiredMappingStrategy.Target)]
public partial class MemberMapper
{
    /// <summary>Request → 新 Entity；Id / UpdatedAt 由服務層設值，故忽略（BR-B-06）。</summary>
    [MapperIgnoreTarget(nameof(Member.Id))]
    [MapperIgnoreTarget(nameof(Member.UpdatedAt))]
    public partial Member ToEntity(MemberRequest req);

    /// <summary>Request → 既有 Entity（更新用）；同樣忽略 Id / UpdatedAt。</summary>
    [MapperIgnoreTarget(nameof(Member.Id))]
    [MapperIgnoreTarget(nameof(Member.UpdatedAt))]
    public partial void Apply(MemberRequest req, Member entity);

    /// <summary>Entity → 回應 Result（MemberResult 無 positionTitle，D10 自然滿足）。</summary>
    public partial MemberResult ToResult(Member entity);

    /// <summary>
    /// BirthDate：DateOnly? → DateOnly 手寫轉換（Mapperly 依型別自動採用此方法，取代產生器內建轉換）。
    /// [Required] 已保證 Validate 通過時必有值，故 .Value 安全；此法同時避免 Mapperly
    /// 對 nullable→non-nullable 的內建轉換發出 RMG 警告（csproj 已將 RMG 警告設為錯誤）。
    /// </summary>
    private static DateOnly MapBirthDate(DateOnly? source) => source!.Value;
}
