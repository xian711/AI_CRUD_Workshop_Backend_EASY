# EF Core DB Notes

Provider:
- SQL Server: `Microsoft.EntityFrameworkCore.SqlServer`
- PostgreSQL: `Npgsql.EntityFrameworkCore.PostgreSQL`

Keep DB context generation small:
- Only add entities needed by current API.
- Do not change migrations unless requested.
- Prefer query projection DTOs for API response.
