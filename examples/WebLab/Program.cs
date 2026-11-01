using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.DataProtection;

var builder = WebApplication.CreateBuilder(args);
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Services.AddControllersWithViews();
builder.Services.AddDataProtection().UseEphemeralDataProtectionProvider(); // Local lab only; keys reset with process.
builder.Services.AddProblemDetails(options => options.CustomizeProblemDetails = ctx =>
    ctx.ProblemDetails.Extensions["traceId"] = ctx.HttpContext.TraceIdentifier);
builder.Services.AddOptions<LabOptions>().BindConfiguration("Lab")
    .Validate(o => !string.IsNullOrWhiteSpace(o.Name), "Lab:Name is required")
    .ValidateOnStart();
builder.Services.AddScoped<Greeting>();
builder.Services.AddAuthorization(o => o.AddPolicy("Admin", p => p.RequireRole("Admin")));
// A temporary local database for this demonstration only. Tests use their own file.
string dbFile = builder.Configuration["Lab:Database"] ?? Path.Combine(Path.GetTempPath(), "ddl-identity-" + Guid.NewGuid().ToString("N") + ".db");
builder.Services.AddDbContext<AuthDb>(o => o.UseSqlite($"Data Source={dbFile}"));
builder.Services.AddIdentityApiEndpoints<IdentityUser>().AddEntityFrameworkStores<AuthDb>();
var app = builder.Build();
using (var scope = app.Services.CreateScope())
    await scope.ServiceProvider.GetRequiredService<AuthDb>().Database.EnsureCreatedAsync();
// This lab deliberately uses EnsureCreated for an ephemeral Identity store;
// the separate MigrationLab demonstrates schema evolution with migrations.
app.UseExceptionHandler();
app.UseStatusCodePages(async status =>
{
    await status.HttpContext.RequestServices.GetRequiredService<IProblemDetailsService>().WriteAsync(new ProblemDetailsContext
    { HttpContext = status.HttpContext, ProblemDetails = new ProblemDetails { Status = status.HttpContext.Response.StatusCode } });
});
app.Use(async (context, next) =>
{
    var logger = context.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("PipelineLab");
    logger.LogInformation("A-in {TraceId}", context.TraceIdentifier);
    context.Response.OnStarting(() => { context.Response.Headers["X-Lab"] = "DotNet"; return Task.CompletedTask; });
    await next(context);
    logger.LogInformation("A-out {TraceId}", context.TraceIdentifier);
});
app.Use(async (context, next) =>
{
    var logger = context.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("PipelineLab");
    logger.LogInformation("B-in {TraceId}", context.TraceIdentifier);
    if (context.Request.Path == "/blocked")
    { context.Response.StatusCode = 403; await context.Response.WriteAsync("short-circuit"); }
    else await next(context);
    logger.LogInformation("B-out {TraceId}", context.TraceIdentifier);
});
app.UseStaticFiles(); // Only wwwroot. Private/ is not mapped publicly.
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapGet("/", (Greeting greeting) => Results.Text(greeting.Text));
app.MapGet("/pipeline", (HttpContext ctx, ILoggerFactory logs) =>
{ logs.CreateLogger("PipelineLab").LogInformation("endpoint {TraceId}", ctx.TraceIdentifier); return Results.Text("endpoint"); });
app.MapGet("/boom", IResult () => throw new InvalidOperationException("Internal lab detail"));
app.MapGet("/config", (IOptions<LabOptions> options) => Results.Ok(new { name = options.Value.Name }));
app.MapGet("/health/live", () => Results.Ok(new { status = "alive" }));
app.MapGet("/health/ready", () => Results.Ok(new { status = "ready", meaning = "local demo only" }));
app.MapGet("/admin", () => Results.Ok(new { message = "admin" })).RequireAuthorization("Admin");
app.MapGet("/mine/{ownerId}", (string ownerId, ClaimsPrincipal user) =>
    user.FindFirstValue(ClaimTypes.NameIdentifier) == ownerId ? Results.Ok(new { ownerId }) : Results.Forbid()).RequireAuthorization();
app.MapGroup("/identity").MapIdentityApi<IdentityUser>();
app.MapPost("/identity/logout", async (SignInManager<IdentityUser> signIn) =>
{ await signIn.SignOutAsync(); return Results.NoContent(); }).RequireAuthorization();
app.MapGet("/etag", (HttpContext context) =>
{
    const string etag = "\"catalog-v1\"";
    context.Response.Headers.ETag = etag;
    context.Response.Headers.CacheControl = "private, max-age=30";
    return context.Request.Headers.IfNoneMatch == etag
        ? Results.StatusCode(304) : Results.Ok(new { value = "catalog" });
});
app.MapControllers();
app.MapControllerRoute("default", "{controller=Students}/{action=Index}/{id?}");
app.Run();
public partial class Program { }
public sealed class LabOptions { public string Name { get; set; } = ""; }
public sealed class Greeting { public string Text => "Xin chào .NET 10"; }
public sealed class AuthDb(DbContextOptions<AuthDb> options) : IdentityDbContext<IdentityUser>(options) { }

[ApiController, Route("api/students")]
public sealed class StudentsApiController : ControllerBase
{
    // Simple local shared store to study HTTP contracts; not a production repository.
    private static readonly System.Collections.Concurrent.ConcurrentDictionary<int, StudentDto> Data = new();
    private static int nextId;
    [HttpGet("{id:int}")]
    public ActionResult<StudentDto> Get(int id) => Data.TryGetValue(id, out var student) ? Ok(student) : NotFound();
    [HttpGet]
    public ActionResult<StudentDto[]> List([FromQuery] int after = 0, [FromQuery] int take = 20)
        => Ok(Data.Values.Where(x => x.Id > after).OrderBy(x => x.Id).Take(Math.Clamp(take, 1, 100)).ToArray());
    [HttpPost]
    public ActionResult<StudentDto> Create(SignupInput input)
    {
        if (Data.Values.Any(x => x.Name == input.Name))
            return Conflict(new ProblemDetails { Status = 409, Title = "Name already used" });
        int id = Interlocked.Increment(ref nextId);
        var student = new StudentDto(id, input.Name!, input.Age!.Value);
        Data[id] = student;
        return CreatedAtAction(nameof(Get), new { id }, student);
    }
    [HttpPut("{id:int}")]
    public IActionResult Update(int id, SignupInput input)
    {
        if (!Data.ContainsKey(id)) return NotFound();
        Data[id] = new(id, input.Name!, input.Age!.Value); return NoContent();
    }
    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id) => Data.TryRemove(id, out _) ? NoContent() : NotFound();
}
public sealed record StudentDto(int Id, string Name, int Age);
public sealed class SignupInput
{
    [Required, StringLength(80)] public string? Name { get; set; }
    [Required, Range(18, 120)] public int? Age { get; set; }
}
[Route("signup")]
public sealed class SignupController : ControllerBase
{
    [HttpPost]
    public IActionResult Post([FromBody] SignupInput input)
        => !ModelState.IsValid ? ValidationProblem(ModelState) : Ok(new { message = "Hợp lệ" });
}
public sealed class StudentsController : Controller
{
    public IActionResult Index() => View(new StudentListViewModel(new[] { "<An>", "Bình" }));
    [HttpGet("students/create")]
    public IActionResult Create() => View(new SignupInput());
    [HttpPost("students/create"), ValidateAntiForgeryToken]
    public IActionResult Create(SignupInput input)
    {
        if (!ModelState.IsValid) return View(input);
        TempData["Message"] = "Đã nhận " + input.Name;
        return RedirectToAction(nameof(Index));
    }
}
public sealed record StudentListViewModel(IReadOnlyList<string> Names);
