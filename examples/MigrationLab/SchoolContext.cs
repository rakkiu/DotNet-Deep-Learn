using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
public class Student { public int Id { get; set; } public string Name { get; set; } = ""; }
public sealed class SchoolContext : DbContext
{
    public DbSet<Student> Students => Set<Student>();
    protected override void OnConfiguring(DbContextOptionsBuilder options) => options.UseSqlite("Data Source=school.db;Pooling=False");
}
public sealed class DesignFactory : IDesignTimeDbContextFactory<SchoolContext>
{ public SchoolContext CreateDbContext(string[] args) => new(); }
