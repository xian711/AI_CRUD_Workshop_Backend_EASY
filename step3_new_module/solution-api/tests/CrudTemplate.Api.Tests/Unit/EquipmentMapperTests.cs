using CrudTemplate.Api.Entities;
using CrudTemplate.Api.Mapping;
using CrudTemplate.Api.Models;

namespace CrudTemplate.Api.Tests.Unit;

/// <summary>
/// 裝備物資 Mapperly 映射單元測試（SDD-delta §9.2）。
/// </summary>
public class EquipmentMapperTests
{
    private readonly EquipmentMapper _mapper = new();

    private static EquipmentItemRequest SampleRequest() => new()
    {
        CategoryKey = "ICT",
        Name = "筆記型電腦",
        Qty = 5,
        Unit = "台",
        Spec1 = "測試規格",
        Keeper = "測試員",
        KeeperPhone = "0912345678",
        LocationName = "測試倉庫",
        Status = "normal",
        PurchaseDate = new DateOnly(2024, 1, 1),
        SpecNote = "備註"
    };

    // ── EM1：ToResult 欄位齊全（14 欄）──
    [Fact] // EM1
    public void EM1_ToResult_欄位齊全()
    {
        var entity = new EquipmentItem
        {
            Id = "E-100",
            Code = "IT-LAP-009",
            CategoryKey = "ICT",
            Name = "筆記型電腦",
            Qty = 7,
            Unit = "台",
            Spec1 = "規格說明",
            Keeper = "王小明",
            KeeperPhone = "0922333444",
            LocationName = "資訊機房",
            Status = "maintenance",
            PurchaseDate = new DateOnly(2023, 6, 1),
            SpecNote = "維修中",
            UpdatedAt = new DateOnly(2026, 7, 11)
        };

        var result = _mapper.ToResult(entity);

        Assert.Equal(entity.Id, result.Id);
        Assert.Equal(entity.Code, result.Code);
        Assert.Equal(entity.CategoryKey, result.CategoryKey);
        Assert.Equal(entity.Name, result.Name);
        Assert.Equal(entity.Qty, result.Qty);
        Assert.Equal(entity.Unit, result.Unit);
        Assert.Equal(entity.Spec1, result.Spec1);
        Assert.Equal(entity.Keeper, result.Keeper);
        Assert.Equal(entity.KeeperPhone, result.KeeperPhone);
        Assert.Equal(entity.LocationName, result.LocationName);
        Assert.Equal(entity.Status, result.Status);
        Assert.Equal(entity.PurchaseDate, result.PurchaseDate);
        Assert.Equal(entity.SpecNote, result.SpecNote);
        Assert.Equal(entity.UpdatedAt, result.UpdatedAt);
    }

    // ── EM2：ToEntity 忽略 Id/Code/UpdatedAt，其餘映射（含 Qty int?→int）──
    [Fact] // EM2
    public void EM2_ToEntity_忽略Id與Code與UpdatedAt()
    {
        var entity = _mapper.ToEntity(SampleRequest());

        // 服務層才設值，故映射後應為預設值
        Assert.Equal(string.Empty, entity.Id);
        Assert.Equal(string.Empty, entity.Code);
        Assert.Equal(default, entity.UpdatedAt);

        // 其餘欄位如常映射（Qty int?→int 手寫轉換）
        Assert.Equal("筆記型電腦", entity.Name);
        Assert.Equal(5, entity.Qty);
        Assert.Equal("normal", entity.Status);
        Assert.Equal(new DateOnly(2024, 1, 1), entity.PurchaseDate);
    }

    // ── EM3：ToEntity 選填欄可為 null（正規化後）──
    [Fact] // EM3
    public void EM3_ToEntity_選填欄為null時映射為null()
    {
        var req = SampleRequest();
        req.Keeper = "";          // setter 正規化為 null
        req.KeeperPhone = "  ";   // setter 正規化為 null
        req.LocationName = null;
        req.PurchaseDate = null;
        req.SpecNote = "";

        var entity = _mapper.ToEntity(req);

        Assert.Null(entity.Keeper);
        Assert.Null(entity.KeeperPhone);
        Assert.Null(entity.LocationName);
        Assert.Null(entity.PurchaseDate);
        Assert.Null(entity.SpecNote);
    }
}
