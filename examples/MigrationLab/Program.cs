using Microsoft.EntityFrameworkCore;
using var db = new SchoolContext();
if (!await db.Students.AnyAsync()) { db.Students.Add(new Student { Name = "An" }); await db.SaveChangesAsync(); }
Console.WriteLine("students:" + await db.Students.CountAsync());
Console.WriteLine("name:" + (await db.Students.SingleAsync()).Name);
