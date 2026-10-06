using CrudTemplate.Api.Common;
using CrudTemplate.Api.Models;
using CrudTemplate.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CrudTemplate.Api.Controllers;

/// <summary>
/// 裝備物資 CRUD 控制器（DESIGN-delta §2 / §3）。薄委派：委派 Service → 依 Success 對映狀態碼。
/// </summary>
/// <remarks>
/// 禁止查詢 / 組路徑 / 商業判斷（皆在 Service）。狀態碼對映與範本一致（201+Location / 400 / 404 / 204）。
/// </remarks>
[ApiController]
[Route("api/equipment/items")]
[Produces("application/json")]
public class EquipmentItemsController(IEquipmentService equipmentService) : ControllerBase
{
    /// <summary>取得全量裝備清單（id 升冪）。</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ModelResult<List<EquipmentItemResult>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var result = await equipmentService.GetAll();
        return result.ToActionResult();
    }

    /// <summary>取得單筆裝備；不存在回 404。</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ModelResult<EquipmentItemResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ModelResult), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(string id)
    {
        var result = await equipmentService.GetById(id);
        return result.ToActionResult(StatusCodes.Status404NotFound);
    }

    /// <summary>新增裝備；成功回 201 + Location。驗證失敗由框架回 400。</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ModelResult<EquipmentItemResult>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] EquipmentItemRequest request)
    {
        var result = await equipmentService.Create(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result);
    }

    /// <summary>全量更新裝備；不存在回 404。驗證失敗由框架回 400。</summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ModelResult<EquipmentItemResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ModelResult), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Update(string id, [FromBody] EquipmentItemRequest request)
    {
        var result = await equipmentService.Update(id, request);
        return result.ToActionResult(StatusCodes.Status404NotFound);
    }

    /// <summary>刪除裝備（hard delete）；成功回 204，不存在回 404。</summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ModelResult), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string id)
    {
        var result = await equipmentService.Delete(id);
        return result.Success
            ? NoContent()
            : result.ToActionResult(StatusCodes.Status404NotFound);
    }
}
