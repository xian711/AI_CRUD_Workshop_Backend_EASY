using CrudTemplate.Api.Common;
using CrudTemplate.Api.Models;
using CrudTemplate.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CrudTemplate.Api.Controllers;

/// <summary>
/// 人員 CRUD 控制器（SDD §2 / §3）。薄委派：委派 Service → 依 Success 對映狀態碼。
/// </summary>
/// <remarks>
/// 禁止查詢/組路徑/商業判斷（皆在 Service）。JWT 接縫：未來以 <c>User</c>(ClaimsPrincipal) 傳入 Service（FR-B-702，本版不啟用）。
/// </remarks>
[ApiController]
[Route("api/template/members")]
[Produces("application/json")]
public class MembersController(IMemberService memberService) : ControllerBase
{
    /// <summary>取得全量人員清單（id 升冪）。</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ModelResult<List<MemberResult>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        // D11：GetAll 不回業務失敗；未預期例外上拋 GlobalExceptionHandler 回 500
        var result = await memberService.GetAll();
        return result.ToActionResult();
    }

    /// <summary>取得單筆人員；不存在回 404。</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ModelResult<MemberResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ModelResult), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(string id)
    {
        var result = await memberService.GetById(id);
        return result.ToActionResult(StatusCodes.Status404NotFound);
    }

    /// <summary>新增人員；成功回 201 + Location。驗證失敗由框架回 400。</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ModelResult<MemberResult>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] MemberRequest request)
    {
        // D11：Create 不回業務失敗；未預期例外上拋 GlobalExceptionHandler 回 500
        var result = await memberService.Create(request);
        // 201 + Location 標頭指向新資源（FR-B-302）
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result);
    }

    /// <summary>全量更新人員；不存在回 404。驗證失敗由框架回 400。</summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ModelResult<MemberResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ModelResult), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Update(string id, [FromBody] MemberRequest request)
    {
        var result = await memberService.Update(id, request);
        return result.ToActionResult(StatusCodes.Status404NotFound);
    }

    /// <summary>刪除人員（hard delete）；成功回 204，不存在回 404。</summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ModelResult), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string id)
    {
        var result = await memberService.Delete(id);
        // 204 無主體（封裝一致性的唯一例外，D5）
        return result.Success
            ? NoContent()
            : result.ToActionResult(StatusCodes.Status404NotFound);
    }
}
