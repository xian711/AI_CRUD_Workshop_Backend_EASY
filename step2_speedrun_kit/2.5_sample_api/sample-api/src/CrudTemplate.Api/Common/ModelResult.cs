namespace CrudTemplate.Api.Common;

/// <summary>
/// 統一 API 回應封裝（基底，無泛型資料）。沿用原單位範本慣例。
/// </summary>
/// <remarks>
/// 設計重點：<see cref="Success"/> 預設為 <c>true</c>，
/// 服務層一旦進入 catch 或商業失敗，一定要把它設為 false。
/// </remarks>
public class ModelResult
{
    /// <summary>是否成功。</summary>
    public bool Success { get; set; } = true;

    /// <summary>對外訊息（務必為「可安全外露」的字串，不得夾帶 ex.Message）。</summary>
    public string Message { get; set; } = string.Empty;
}

/// <summary>統一 API 回應封裝（帶泛型資料）。</summary>
/// <typeparam name="T">資料型別。</typeparam>
public class ModelResult<T> : ModelResult
{
    /// <summary>回應資料。</summary>
    public T? Data { get; set; }
}
