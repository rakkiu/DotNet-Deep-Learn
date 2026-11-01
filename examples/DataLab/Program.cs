using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using System.Data.Common;
var folder = Path.Combine(Path.GetTempPath(), "ddl-data-" + Guid.NewGuid().ToString("N"));
Directory.CreateDirectory(folder);
try
{
    var counter = new CommandCounter();
    var options = new DbContextOptionsBuilder<School>().UseSqlite($"Data Source={Path.Combine(folder, "school.db")};Pooling=False")
        .AddInterceptors(counter).Options;
    using var db = new School(options);
    await db.Database.EnsureCreatedAsync(); // Isolated fixed schema; MigrationLab is separate.
    var department = new Department { Name = "CNTT" };
    var an = new Student { Name = "An", Score = 8, Department = department, Profile = new Profile { Bio = "demo" } };
    var binh = new Student { Name = "Bình", Score = 5, Department = department };
    var empty = new Department { Name = "Empty" };
    var course = new Course { Name = "C#" };
    db.AddRange(department, an, binh, empty, course);
    db.Add(new Enrollment { Student = an, Course = course, RegisteredAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) });
    Console.WriteLine("state:" + db.Entry(an).State);
    await db.SaveChangesAsync();
    Console.WriteLine("state:" + db.Entry(an).State);
    binh.Score = 6; db.ChangeTracker.DetectChanges();
    Console.WriteLine("state:" + db.Entry(binh).State);
    using (var observer = new School(options)) Console.WriteLine("before-save:" + (await observer.Students.SingleAsync(s => s.Id == binh.Id)).Score);
    await db.SaveChangesAsync();
    Console.WriteLine("after-save:" + (await db.Students.AsNoTracking().SingleAsync(s => s.Id == binh.Id)).Score);
    db.ChangeTracker.Clear();
    var tracked = await db.Students.SingleAsync(s => s.Id == an.Id);
    var same = await db.Students.SingleAsync(s => s.Id == an.Id);
    var independent = await db.Students.AsNoTracking().SingleAsync(s => s.Id == an.Id);
    Console.WriteLine($"identity:{ReferenceEquals(tracked, same)}/{ReferenceEquals(tracked, independent)}");
    var query = db.Students.AsNoTracking().Where(s => s.Score >= 6).OrderBy(s => s.Id).Select(s => new { s.Name, Department = s.Department.Name });
    Console.WriteLine("SQL:" + query.ToQueryString());
    counter.Reads = 0; var projection = await query.ToListAsync();
    Console.WriteLine("projection-read-commands:" + counter.Reads);
    Console.WriteLine("projection:" + string.Join(",", projection.Select(x => x.Name)));
    db.ChangeTracker.Clear();
    counter.Reads = 0;
    var graph = await db.Departments.Include(d => d.Students).ThenInclude(s => s.Enrollments).AsSplitQuery().ToListAsync();
    Console.WriteLine("split-has-multiple-commands:" + (counter.Reads > 1));
    Console.WriteLine("join-payload:" + (await db.Enrollments.Select(e => e.RegisteredAt.Year).SingleAsync()));
    using (var first = new School(options))
    using (var second = new School(options))
    {
        var left = await first.Students.SingleAsync(s => s.Id == an.Id);
        var right = await second.Students.SingleAsync(s => s.Id == an.Id);
        left.Score = 9; left.Revision++; await first.SaveChangesAsync();
        right.Score = 10; right.Revision++;
        try { await second.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException) { Console.WriteLine("concurrency:conflict"); await second.Entry(right).ReloadAsync(); }
    }
    using (var transaction = await db.Database.BeginTransactionAsync())
    {
        db.Students.Add(new Student { Name = "Temporary", Score = 1, DepartmentId = department.Id });
        await db.SaveChangesAsync(); await transaction.RollbackAsync(); db.ChangeTracker.Clear();
    }
    Console.WriteLine("rollback:" + !await db.Students.AnyAsync(s => s.Name == "Temporary"));
    await db.Database.OpenConnectionAsync();
    await using (var command = db.Database.GetDbConnection().CreateCommand())
    {
        command.CommandText = "SELECT d.Name, COUNT(s.Id) FROM Departments d LEFT JOIN Students s ON s.DepartmentId=d.Id GROUP BY d.Id, d.Name HAVING COUNT(s.Id)>=0 ORDER BY d.Name";
        await using var rows = await command.ExecuteReaderAsync();
        while (await rows.ReadAsync()) Console.WriteLine($"left:{rows.GetString(0)}:{rows.GetInt64(1)}");
    }
    string nameParameter = "An";
    Console.WriteLine("parameterized:" + await db.Students.FromSql($"SELECT * FROM Students WHERE Name={nameParameter}").CountAsync());
    try { await db.Departments.Where(d => d.Id == department.Id).ExecuteDeleteAsync(); }
    catch (SqliteException) { Console.WriteLine("restrict:blocked"); }
    var local = await db.Students.SingleAsync(s => s.Id == binh.Id);
    await db.Students.Where(s => s.Id == binh.Id).ExecuteUpdateAsync(set => set.SetProperty(s => s.Score, 7));
    Console.WriteLine("bulk-stale:" + local.Score); await db.Entry(local).ReloadAsync();
    Console.WriteLine("bulk-reloaded:" + local.Score);
    var added = new Student { Name = "Delete me", Score = 0, DepartmentId = department.Id };
    db.Add(added); await db.SaveChangesAsync(); db.Remove(added);
    Console.WriteLine("state:" + db.Entry(added).State); await db.SaveChangesAsync();
    Console.WriteLine("state:" + db.Entry(added).State);
}
finally { SqliteConnection.ClearAllPools(); Directory.Delete(folder, true); }
public sealed class School(DbContextOptions<School> options) : DbContext(options)
{
    public DbSet<Student> Students => Set<Student>(); public DbSet<Department> Departments => Set<Department>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    protected override void OnModelCreating(ModelBuilder m)
    {
        m.Entity<Student>().HasIndex(s => s.Name).IsUnique();
        m.Entity<Student>().Property(s => s.Revision).IsConcurrencyToken(); // App-managed, not SQL Server rowversion.
        m.Entity<Student>().HasOne(s => s.Department).WithMany(d => d.Students).HasForeignKey(s => s.DepartmentId).OnDelete(DeleteBehavior.Restrict);
        m.Entity<Student>().HasOne(s => s.Profile).WithOne(p => p.Student).HasForeignKey<Profile>(p => p.StudentId);
        m.Entity<Enrollment>().HasKey(e => new { e.StudentId, e.CourseId });
        m.Entity<Enrollment>().HasOne(e => e.Student).WithMany(s => s.Enrollments).HasForeignKey(e => e.StudentId);
        m.Entity<Enrollment>().HasOne(e => e.Course).WithMany(c => c.Enrollments).HasForeignKey(e => e.CourseId);
    }
}
public sealed class Student { public int Id { get; set; } public string Name { get; set; } = ""; public int Score { get; set; } public int Revision { get; set; } public int DepartmentId { get; set; } public Department Department { get; set; } = null!; public Profile? Profile { get; set; } public List<Enrollment> Enrollments { get; set; } = new(); }
public sealed class Department { public int Id { get; set; } public string Name { get; set; } = ""; public List<Student> Students { get; set; } = new(); }
public sealed class Profile { public int Id { get; set; } public int StudentId { get; set; } public Student Student { get; set; } = null!; public string Bio { get; set; } = ""; }
public sealed class Course { public int Id { get; set; } public string Name { get; set; } = ""; public List<Enrollment> Enrollments { get; set; } = new(); }
public sealed class Enrollment { public int StudentId { get; set; } public Student Student { get; set; } = null!; public int CourseId { get; set; } public Course Course { get; set; } = null!; public DateTime RegisteredAt { get; set; } }
public sealed class CommandCounter : DbCommandInterceptor
{
    public int Reads;
    public override ValueTask<DbDataReader> ReaderExecutedAsync(DbCommand command, CommandExecutedEventData data, DbDataReader result, CancellationToken cancellationToken = default)
    { Interlocked.Increment(ref Reads); return ValueTask.FromResult(result); }
}
