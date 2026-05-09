using Microsoft.Data.Sqlite;
var db = @"C:\Users\joeth\OneDrive\Desktop\seminar-demo\COMP-585-Project-Team-2\HealthcareSchedulerAPI\healthcare_scheduler.db";
using var conn = new SqliteConnection($"Data Source={db}");
conn.Open();
foreach (var sql in new[] {
    "ALTER TABLE Users ADD COLUMN PasswordResetToken TEXT",
    "ALTER TABLE Users ADD COLUMN PasswordResetTokenExpiry TEXT"
}) {
    try {
        using var cmd = conn.CreateCommand();
        cmd.CommandText = sql;
        cmd.ExecuteNonQuery();
        Console.WriteLine($"OK: {sql}");
    } catch (Exception ex) {
        Console.WriteLine($"Skipped ({ex.Message}): {sql}");
    }
}
Console.WriteLine("Done");
