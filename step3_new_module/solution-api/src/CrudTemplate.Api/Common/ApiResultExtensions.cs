using Microsoft.AspNetCore.Mvc;

namespace CrudTemplate.Api.Common;

/// <summary>
/// 把 <see cref="ModelResult"/> 轉為語意正確的 <see cref="IActionResult"/>（沿用原單位範本）。
/// </summary>
/// <remarks>
/// 避免「不論成功失敗一律回 200」：Success=false 時映射到適當的 4xx/5xx，
/// 前端與監控才能靠 HTTP 狀態碼判斷可用性（DESIGN §7）。
/// </remarks>
public static class ApiResultExtensions
{
    /// <summary>
    /// 成功回 200；失敗回 <paramref name="failureStatusCode"/>（預設 400；找不到請傳 404）。
    /// </summary>
    public static IActionResult ToActionResult(
        this ModelResult result,
        int failureStatusCode = StatusCodes.Status400BadRequest)
    {
        return result.Success
            ? new OkObjectResult(result)
            : new ObjectResult(result) { StatusCode = failureStatusCode };
    }
}
