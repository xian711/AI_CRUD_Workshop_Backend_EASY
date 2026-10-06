using CrudTemplate.Api.Entities;
using CrudTemplate.Api.Mapping;
using CrudTemplate.Api.Models;

namespace CrudTemplate.Api.Tests.Unit;

/// <summary>
/// Mapperly 映射單元測試（DESIGN §9.2：U6、U7）。
/// </summary>
public class MemberMapperTests
{
    private readonly MemberMapper _mapper = new();

    private static MemberRequest SampleRequest() => new()
    {
        Name = "測試員",
        Gender = "女",
        BirthDate = new DateOnly(1988, 5, 20),
        IdType = "身分證",
        NationalId = "A223456789",
        Phone = "0912345678",
        Email = "sample@example.tw",
        ResidenceCounty = "臺東縣",
        ResidenceTownship = "臺東市",
        ResidenceAddress = "某路2號",
        GroupName = "醫護組",
        PositionCode = "leader",
        Qualifications = ["防災士", "急救證照"],
        Status = "在職",
        Note = "備註",
        BloodType = "AB"
    };

    // ── U6：ToResult 欄位齊全且無 positionTitle（BR-B-05）──────────
    [Fact] // U6
    public void U6_ToResult_欄位齊全()
    {
        var entity = new Member
        {
            Id = "M-100",
            Name = "王小明",
            Gender = "男",
            BirthDate = new DateOnly(1990, 3, 1),
            IdType = "身分證",
            NationalId = "A123456789",
            Phone = "0912345678",
            Email = "wang@example.tw",
            ResidenceCounty = "臺東縣",
            ResidenceTownship = "卑南鄉",
            ResidenceAddress = "文化路22號",
            GroupName = "指揮組",
            PositionCode = "member",
            Qualifications = ["TCERT"],
            Status = "在職",
            Note = "測試",
            BloodType = "A",
            UpdatedAt = new DateOnly(2026, 7, 5)
        };

        var result = _mapper.ToResult(entity);

        Assert.Equal(entity.Id, result.Id);
        Assert.Equal(entity.Name, result.Name);
        Assert.Equal(entity.Gender, result.Gender);
        Assert.Equal(entity.BirthDate, result.BirthDate);
        Assert.Equal(entity.IdType, result.IdType);
        Assert.Equal(entity.NationalId, result.NationalId);
        Assert.Equal(entity.Phone, result.Phone);
        Assert.Equal(entity.Email, result.Email);
        Assert.Equal(entity.ResidenceCounty, result.ResidenceCounty);
        Assert.Equal(entity.ResidenceTownship, result.ResidenceTownship);
        Assert.Equal(entity.ResidenceAddress, result.ResidenceAddress);
        Assert.Equal(entity.GroupName, result.GroupName);
        Assert.Equal(entity.PositionCode, result.PositionCode);
        Assert.Equal(entity.Qualifications, result.Qualifications);
        Assert.Equal(entity.Status, result.Status);
        Assert.Equal(entity.Note, result.Note);
        Assert.Equal(entity.BloodType, result.BloodType);   // Contract v2
        Assert.Equal(entity.UpdatedAt, result.UpdatedAt);

        // 無 positionTitle：型別上不存在該屬性（D10），以反射確認契約
        Assert.Null(typeof(MemberResult).GetProperty("PositionTitle"));
    }

    // ── U7：ToEntity 忽略 Id/UpdatedAt（BR-B-06）──────────────────
    [Fact] // U7
    public void U7_ToEntity_忽略Id與UpdatedAt()
    {
        var entity = _mapper.ToEntity(SampleRequest());

        // 服務層才設值，故映射後應為預設值
        Assert.Equal(string.Empty, entity.Id);
        Assert.Equal(default, entity.UpdatedAt);

        // 其餘欄位如常映射
        Assert.Equal("測試員", entity.Name);
        Assert.Equal(["防災士", "急救證照"], entity.Qualifications);
        Assert.Equal("AB", entity.BloodType);   // Contract v2：bloodType 映射
    }
}
