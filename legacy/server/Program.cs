using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var dbPath = Environment.GetEnvironmentVariable("DEEPLEARN_DB") ?? Path.Combine(builder.Environment.ContentRootPath, "Data", "learning.db");
Directory.CreateDirectory(Path.GetDirectoryName(Path.GetFullPath(dbPath))!);
builder.Services.AddDbContext<LearningDb>(o => o.UseSqlite($"Data Source={dbPath}"));
var app = builder.Build();
app.Use(async (context, next) => {
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    try { await next(); }
    catch (BadHttpRequestException) { context.Response.StatusCode = 400; await context.Response.WriteAsJsonAsync(new { error = "Dữ liệu gửi lên không hợp lệ." }); }
    catch (Exception ex) { app.Logger.LogError(ex, "Request failed"); context.Response.StatusCode = 500; await context.Response.WriteAsJsonAsync(new { error = "Không thể lưu hoặc tải dữ liệu. Vui lòng thử lại." }); }
});
using (var scope = app.Services.CreateScope()) {
    var db = scope.ServiceProvider.GetRequiredService<LearningDb>();
    db.Database.EnsureCreated();
    var json = JsonNode.Parse(File.ReadAllText(Path.Combine(builder.Environment.ContentRootPath, "Data/catalog.json")))!;
    foreach (var topic in json["topics"]!.AsArray()) {
        var id = (string)topic!["id"]!;
        var row = db.Topics.Find(id);
        if (row is null) db.Topics.Add(new ContentRow { Id = id, Json = topic.ToJsonString() });
        else row.Json = topic.ToJsonString();
    }
    foreach (var lesson in json["lessons"]!.AsArray()) {
        var id = (string)lesson!["id"]!;
        var row = db.Lessons.Find(id);
        if (row is null) db.Lessons.Add(new LessonRow { Id = id, Json = lesson.ToJsonString() });
        else row.Json = lesson.ToJsonString();
    }
    db.SaveChanges(); // Upsert content only; never delete learner state.
}

app.MapGet("/api/health", async (LearningDb db) => Results.Ok(new { status = await db.Database.CanConnectAsync() ? "ok" : "error", mode = "personal" }));
app.MapGet("/api/catalog", async (LearningDb db) => {
    var topics = (await db.Topics.OrderBy(x => x.Id).ToListAsync()).Select(x => JsonNode.Parse(x.Json)).OrderBy(x => (int)x!["order"]!);
    var lessons = (await db.Lessons.ToListAsync()).Select(x => PublicLesson(JsonNode.Parse(x.Json)!)).OrderBy(x => (int)x["order"]!);
    return Results.Ok(new { topics, lessons });
});
app.MapGet("/api/state", async (LearningDb db) => Results.Ok(new {
    progress = await db.Progress.ToListAsync(), notes = await db.Notes.ToListAsync(),
    bookmarks = await db.Bookmarks.ToListAsync(), submissions = await db.Submissions.ToListAsync(),
    attempts = await db.Attempts.OrderBy(x => x.Id).ToListAsync()
}));
app.MapPut("/api/progress/{lessonId}", async (string lessonId, ProgressInput input, LearningDb db) => {
    if (await db.Lessons.FindAsync(lessonId) is null || !new[] { "explain", "examples", "quiz", "exercises" }.Contains(input.Section)) return Invalid();
    var row = await db.Progress.FindAsync(lessonId);
    if (row is null) { row = new LearningProgress { LessonId = lessonId }; db.Progress.Add(row); }
    row.Section = input.Section; row.Read = input.Read; row.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync(); return Results.Ok(row);
});
app.MapPut("/api/notes/{lessonId}", async (string lessonId, NoteInput input, LearningDb db) => {
    if (await db.Lessons.FindAsync(lessonId) is null || input.Text is null || input.Text.Length > 20000) return Invalid();
    var row = await db.Notes.FindAsync(lessonId);
    if (row is null) { row = new Note { LessonId = lessonId }; db.Notes.Add(row); }
    row.Text = input.Text; await db.SaveChangesAsync(); return Results.Ok(row);
});
app.MapPut("/api/bookmarks/{lessonId}", async (string lessonId, BookmarkInput input, LearningDb db) => {
    if (await db.Lessons.FindAsync(lessonId) is null) return Invalid();
    var row = await db.Bookmarks.FindAsync(lessonId);
    if (input.Saved && row is null) db.Bookmarks.Add(new Bookmark { LessonId = lessonId });
    if (!input.Saved && row is not null) db.Bookmarks.Remove(row);
    await db.SaveChangesAsync(); return Results.Ok(new { saved = input.Saved });
});
app.MapPost("/api/lessons/{lessonId}/quiz/{questionId}", async (string lessonId, string questionId, AnswerInput input, LearningDb db) => {
    var lesson = await FindLesson(db, lessonId);
    var question = lesson?["questions"]!.AsArray().FirstOrDefault(x => (string)x!["id"]! == questionId);
    if (question is null || !question["options"]!.AsArray().Any(x => (string)x!["id"]! == input.OptionId)) return Invalid();
    var correct = (string)question["correctOptionId"]! == input.OptionId;
    var feedback = new { correct, correctOptionId = (string)question["correctOptionId"]!, explanation = (string)question["explanation"]!, options = question["options"]!.DeepClone() };
    var attempt = new QuizAttempt { LessonId = lessonId, QuestionId = questionId, OptionId = input.OptionId!, Correct = correct, Feedback = JsonSerializer.Serialize(feedback, new JsonSerializerOptions(JsonSerializerDefaults.Web)), CreatedAt = DateTime.UtcNow };
    db.Attempts.Add(attempt); await db.SaveChangesAsync(); return Results.Ok(attempt);
});
app.MapPost("/api/lessons/{lessonId}/examples/{exampleId}", async (string lessonId, string exampleId, AnswerInput input, LearningDb db) => {
    var lesson = await FindLesson(db, lessonId);
    var example = lesson?["examples"]!.AsArray().FirstOrDefault(x => (string)x!["id"]! == exampleId);
    if (example is null || !example["options"]!.AsArray().Any(x => (string)x!["id"]! == input.OptionId)) return Invalid();
    return Results.Ok(new { correct = (string)example["correctOptionId"]! == input.OptionId, output = example["output"]!.DeepClone(), steps = example["steps"]!.DeepClone(), comparison = (string)example["comparison"]!, table = example["table"]?.DeepClone() });
});
app.MapPut("/api/lessons/{lessonId}/exercises/{exerciseId}", async (string lessonId, string exerciseId, SubmissionInput input, LearningDb db) => {
    var lesson = await FindLesson(db, lessonId);
    var exercise = lesson?["exercises"]!.AsArray().FirstOrDefault(x => (string)x!["id"]! == exerciseId);
    if (exercise is null || input.Code is null || input.Code.Length > 30000 || input.Checks is null || input.Checks.Length != exercise["checklist"]!.AsArray().Count || (input.Assessed && (string.IsNullOrWhiteSpace(input.Code) || input.Checks.Any(x => !x)))) return Invalid();
    var key = lessonId + ":" + exerciseId;
    var row = await db.Submissions.FindAsync(key);
    if (row is null) { row = new ExerciseSubmission { Id = key, LessonId = lessonId, ExerciseId = exerciseId }; db.Submissions.Add(row); }
    row.Code = input.Code; row.Checks = JsonSerializer.Serialize(input.Checks); row.Assessed = input.Assessed; row.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync(); return Results.Ok(row);
});

var webRoot = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "../client/dist"));
if (Directory.Exists(webRoot)) {
    app.UseDefaultFiles(new DefaultFilesOptions { FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(webRoot) });
    app.UseStaticFiles(new StaticFileOptions { FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(webRoot) });
    app.MapFallback((HttpContext ctx) => {
        if (ctx.Request.Path.StartsWithSegments("/api")) return Results.NotFound(new { error = "API không tồn tại." });
        return Results.File(Path.Combine(webRoot, "index.html"), "text/html; charset=utf-8");
    });
}
app.Run();

static IResult Invalid() => Results.BadRequest(new { error = "Dữ liệu không hợp lệ. Kiểm tra lựa chọn và nội dung trước khi lưu." });
static async Task<JsonNode?> FindLesson(LearningDb db, string id) { var row = await db.Lessons.FindAsync(id); return row is null ? null : JsonNode.Parse(row.Json); }
static JsonNode PublicLesson(JsonNode node) {
    foreach (var question in node["questions"]!.AsArray()) {
        question!.AsObject().Remove("correctOptionId"); question.AsObject().Remove("explanation");
        foreach (var option in question["options"]!.AsArray()) option!.AsObject().Remove("explanation");
    }
    foreach (var example in node["examples"]!.AsArray()) foreach (var field in new[] { "correctOptionId", "output", "steps", "comparison", "table" }) example!.AsObject().Remove(field);
    return node;
}
public class LearningDb(DbContextOptions<LearningDb> options) : DbContext(options) {
    public DbSet<ContentRow> Topics => Set<ContentRow>(); public DbSet<LessonRow> Lessons => Set<LessonRow>();
    public DbSet<LearningProgress> Progress => Set<LearningProgress>(); public DbSet<QuizAttempt> Attempts => Set<QuizAttempt>();
    public DbSet<ExerciseSubmission> Submissions => Set<ExerciseSubmission>(); public DbSet<Note> Notes => Set<Note>(); public DbSet<Bookmark> Bookmarks => Set<Bookmark>();
    protected override void OnModelCreating(ModelBuilder b) { b.Entity<LearningProgress>().HasKey(x => x.LessonId); b.Entity<Note>().HasKey(x => x.LessonId); b.Entity<Bookmark>().HasKey(x => x.LessonId); }
}
public class ContentRow { public string Id { get; set; } = ""; public string Json { get; set; } = ""; }
public class LessonRow { public string Id { get; set; } = ""; public string Json { get; set; } = ""; }
public class LearningProgress { public string LessonId { get; set; } = ""; public string Section { get; set; } = "explain"; public bool Read { get; set; } public DateTime UpdatedAt { get; set; } }
public class Note { public string LessonId { get; set; } = ""; public string Text { get; set; } = ""; }
public class Bookmark { public string LessonId { get; set; } = ""; }
public class QuizAttempt { public long Id { get; set; } public string LessonId { get; set; } = ""; public string QuestionId { get; set; } = ""; public string OptionId { get; set; } = ""; public bool Correct { get; set; } public string Feedback { get; set; } = ""; public DateTime CreatedAt { get; set; } }
public class ExerciseSubmission { public string Id { get; set; } = ""; public string LessonId { get; set; } = ""; public string ExerciseId { get; set; } = ""; public string Code { get; set; } = ""; public string Checks { get; set; } = "[]"; public bool Assessed { get; set; } public DateTime UpdatedAt { get; set; } }
public record ProgressInput(string Section, bool Read);
public record NoteInput(string Text);
public record BookmarkInput(bool Saved);
public record AnswerInput(string? OptionId);
public record SubmissionInput(string Code, bool Assessed, bool[] Checks);
