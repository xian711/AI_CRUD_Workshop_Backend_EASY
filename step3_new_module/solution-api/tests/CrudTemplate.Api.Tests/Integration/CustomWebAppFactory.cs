using CrudTemplate.Api.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Npgsql;

namespace CrudTemplate.Api.Tests.Integration;

/// <summary>
/// 整合測試工廠（DESIGN §9.1）。連線字串預設指向 <c>ai_crud_template_test</c>，
/// 可被環境變數 <see cref="TestConnectionEnvVar"/> 覆蓋（多人/CI 環境隔離用）。
/// </summary>
/// <remarks>
/// 以 <see cref="ConfigureWebHost"/> 內的 <c>ConfigureTestServices</c> 直接替換
/// <see cref="AppDbContext"/> 的 DbContextOptions 服務註冊，取代連線字串。
///
/// 為何不能用 <c>ConfigureAppConfiguration</c> 覆蓋組態：Program.cs 在 minimal hosting
/// 下於 <c>builder.Build()</c> 之前就同步呼叫
/// <c>builder.Configuration.GetConnectionString("Default")</c> 並把結果值捕捉進
/// <c>AddDbContext</c> 的 closure（<c>options.UseNpgsql(connectionString)</c>），
/// 之後才會套用測試工廠加的 in-memory 組態來源；等 in-memory 覆蓋值真正生效時，
/// DbContextOptions 早已用「反壓回來的」appsettings.Development.json 值定案，
/// 導致整合測試實際打到開發 DB（實證：ai_crud_template_test 從未被建立，
/// 開發 DB ai_crud_template 卻累積出測試髒資料）。唯一可靠的做法是等 DI 容器組好後，
/// 直接把 AppDbContext 的服務註冊整組換掉。
/// </remarks>
public class CustomWebAppFactory : WebApplicationFactory<Program>
{
    /// <summary>可覆蓋測試連線字串的環境變數名稱。</summary>
    public const string TestConnectionEnvVar = "CRUDTEMPLATE_TEST_CONNECTION";

    private const string DefaultTestConnectionString =
        "Host=localhost;Port=5432;Database=ai_crud_equipment_test;Username=postgres;Password=12345";

    /// <summary>實際使用的測試連線字串：有環境變數覆蓋則優先，否則用預設值。</summary>
    public static string TestConnectionString =>
        Environment.GetEnvironmentVariable(TestConnectionEnvVar) is { Length: > 0 } fromEnv
            ? fromEnv
            : DefaultTestConnectionString;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // ConfigureTestServices 在 Program.cs 的 builder.Services.AddDbContext(...) 執行「之後」、
        // 但仍在 app.Build()（進而觸發 Migrate()/Seed()）之前套用，
        // 所以移除舊註冊、換上測試連線字串一定能生效，且啟動遷移／種子資料也會落在測試 DB 上。
        builder.ConfigureTestServices(services =>
        {
            // 移除原本以開發連線字串定案的 DbContextOptions<AppDbContext> 註冊，
            // 以及 EF Core 10 用來組裝該 options 的 IDbContextOptionsConfiguration<AppDbContext> 設定委派。
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.RemoveAll<IDbContextOptionsConfiguration<AppDbContext>>();

            services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(TestConnectionString));
        });
    }
}

/// <summary>
/// 資料庫夾具：每輪測試開始 EnsureDeleted → Migrate → seed，保證乾淨已知狀態（DESIGN §9.1）。
/// </summary>
public sealed class DatabaseFixture : IDisposable
{
    public CustomWebAppFactory Factory { get; }

    public DatabaseFixture()
    {
        Factory = new CustomWebAppFactory();

        using var scope = Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // 防呆（DESIGN §9.1）：EnsureDeleted 會整庫刪除，因此不能只檢查「打算用的」連線字串常數
        // ——這正是先前漏洞的成因：組態覆蓋沒生效，但字串檢查看的是覆蓋前的目標值，因而沒攔到。
        // 改為檢查 host 實際生效的連線（DI 容器組好後的 AppDbContext 真正連到的資料庫），
        // 若名稱不含 test 一律拒跑，避免誤刪開發／正式資料庫（PG 庫名小寫，故比對 _test）。
        var conn = db.Database.GetDbConnection();
        var dbName = conn.Database;
        if (!dbName.EndsWith("_test", StringComparison.Ordinal))
        {
            throw new InvalidOperationException(
                $"拒絕執行整合測試：實際生效的資料庫連線指向「{dbName}」，名稱未以 _test 結尾，" +
                $"為避免誤刪非測試資料庫已中止。請確認 {CustomWebAppFactory.TestConnectionEnvVar} 環境變數或預設連線字串正確。");
        }

        // 第二道防呆：EnsureDeleted 會整庫 DROP，即使庫名以 _test 結尾，也絕不允許打到遠端主機。
        // 只放行本機 loopback（localhost / 127.0.0.1 / ::1）——避免 CRUDTEMPLATE_TEST_CONNECTION 被
        // 誤設成共享/正式伺服器時，把某台遠端的 *_test 庫刪掉。單機課堂本就只連本機，正常不受影響。
        // 從連線字串解析 host（用 NpgsqlConnectionStringBuilder，不依賴連線已開啟；
        // NpgsqlConnection.Host 在未開啟前可能為空字串）。
        var host = new NpgsqlConnectionStringBuilder(conn.ConnectionString).Host ?? string.Empty;
        var loopbackHosts = new[] { "localhost", "127.0.0.1", "::1" };
        if (!loopbackHosts.Contains(host, StringComparer.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                $"拒絕執行整合測試：測試連線主機為「{host}」，非本機 loopback（localhost/127.0.0.1/::1）。" +
                $"EnsureDeleted 會整庫刪除，為避免誤刪遠端資料庫已中止。整合測試僅限單機本地執行。");
        }

        // PostgreSQL 獵區：主機啟動已跑過 Migrate()/Seed()，池中殘留對測試 DB 的實體連線，
        // 會讓 EnsureDeleted() 的 DROP DATABASE 撞上「database is being accessed by other users」。
        // 先清空所有連線池釋放這些連線，DROP 才能成功（SQL Server 版無此問題）。
        // 注意保證範圍：ClearAllPools() 只清「本測試進程」的 Npgsql 連線池；其他程序（另一個
        // dotnet test、IDE 的 DB 工具、開著的 psql）對測試庫的連線不受影響，仍可能擋住 DROP。
        // 單機、同一時間只跑一輪測試是本範本的明文假設（見 SETUP.md §3）。
        NpgsqlConnection.ClearAllPools();

        db.Database.EnsureDeleted();
        db.Database.Migrate();
        DbSeeder.Seed(db);
    }

    public void Dispose() => Factory.Dispose();
}

/// <summary>整合測試共用同一 factory / DB 夾具（避免每個測試重建整庫）。</summary>
[CollectionDefinition("Api")]
public sealed class ApiCollection : ICollectionFixture<DatabaseFixture>;
