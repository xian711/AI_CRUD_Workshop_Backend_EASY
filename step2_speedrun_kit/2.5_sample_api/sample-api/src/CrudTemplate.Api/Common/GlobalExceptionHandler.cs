using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace CrudTemplate.Api.Common;

/// <summary>
/// 全域例外處理（沿用原單位範本）。以 <see cref="IExceptionHandler"/> + ProblemDetails 統一輸出。
/// </summary>
/// <remarks>
/// NFR-B-04：未攔截例外回 500 + ProblemDetails{ traceId }，
/// 完整例外只進伺服器日誌，永不對外露出 ex.Message / 堆疊 / 連線字串。
/// </remarks>
public sealed class GlobalExceptionHandler(
    ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var traceId = httpContext.TraceIdentifier;

        // 完整例外只進伺服器日誌，不外露
        logger.LogError(exception, "未處理的例外 (traceId: {TraceId})", traceId);

        var problem = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "伺服器發生未預期的錯誤",
            Detail = "請稍後再試，若持續發生請聯繫系統管理員並提供 traceId。",
            Extensions = { ["traceId"] = traceId }
        };

        httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await httpContext.Response.WriteAsJsonAsync(
            problem, options: null, contentType: "application/problem+json", cancellationToken);
        return true;
    }
}
