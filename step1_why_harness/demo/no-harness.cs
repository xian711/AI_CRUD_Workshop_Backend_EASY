// ============================================================
//  沒有 harness：AI 憑一句話自由發揮的典型產出
//  「幫我用 .NET 寫一個新增裝備的 API」
//  能跑，但每一處決策都是 AI 隨興決定的——放到團隊裡就是災難
// ============================================================
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace EquipmentApi.Controllers;

[ApiController]
[Route("api")]
public class EquipmentController : ControllerBase
{
    // 連線字串硬編碼在 Controller 裡，帳密全都攤在原始碼
    private string connstr = "Host=localhost;Port=5432;Database=ai_crud_equipment;Username=postgres;Password=12345";

    // 路由亂取、動詞塞進 URL、欄位命名到處不一致（Name/item_name/qty1/spec）
    [HttpPost("addEquipment")]
    public IActionResult AddEquipment(string categoryKey, string Name, int qty1,
        string unit, string spec, string keeper, string status)
    {
        try
        {
            // 完全沒有驗證：空字串、負數量、亂填的 status 通通照收
            // 連線與 SQL 全塞在 Controller，資料存取沒有分層
            var conn = new NpgsqlConnection(connstr);
            conn.Open();

            // 編碼直接用時間戳硬湊，不保證唯一、也不符合「前綴-流水3碼」規則
            string code = "IT-" + DateTime.Now.Ticks;

            // 字串拼接組 SQL —— 典型 SQL Injection 破口（keeper 打個單引號就爆或被注入）
            string sql = "INSERT INTO equipment_item (code, category_key, name, qty, unit, spec1, keeper, status) VALUES (" +
                "'" + code + "','" + categoryKey + "','" + Name + "'," + qty1 + ",'" + unit + "','" +
                spec + "','" + keeper + "','" + status + "')";

            var cmd = new NpgsqlCommand(sql, conn);
            cmd.ExecuteNonQuery();
            conn.Close();

            // 不管成功失敗都回 200；訊息中英夾雜
            return Ok(new { msg = "add equipment 成功!", code = code });
        }
        catch (Exception ex)
        {
            // blanket try/catch 把所有例外吞掉，DB 斷線也照樣回 200
            // 還把 ex.Message 直接外露給前端（洩漏連線字串、資料表結構）
            return Ok(new { msg = "有錯誤: " + ex.Message });
        }
    }

    // 查詢也塞在同一個 Controller，一樣硬開連線、一樣裸物件
    [HttpGet("getEquipmentList")]
    public IActionResult GetList()
    {
        var conn = new NpgsqlConnection(connstr);
        conn.Open();
        var cmd = new NpgsqlCommand("SELECT * FROM equipment_item", conn);
        var reader = cmd.ExecuteReader();
        var list = new List<object>();
        while (reader.Read())
        {
            // 欄位用索引硬取，順序一改就整包錯位
            list.Add(new
            {
                Id = reader[0],
                itemCode = reader[1],
                item_name = reader[3],
                Qty = reader[4],
            });
        }
        conn.Close();
        return Ok(list);
    }
}
