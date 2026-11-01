using System.Collections.Concurrent;
using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Xunit;

[CollectionDefinition("WebLab", DisableParallelization = true)] public class WebLabCollection { }
[Collection("WebLab")]
public class HttpContractsTests
{
    [Fact]
    public async Task Api_Create_Read_Validate_Conflict_Update_Delete()
    {
        await using var factory = new LabFactory();
        using var client = factory.CreateClient();
        var name = "Student-" + Guid.NewGuid().ToString("N");
        var created = await client.PostAsJsonAsync("/api/students", new { name, age = 20 });
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        Assert.NotNull(created.Headers.Location);
        var read = await client.GetAsync(created.Headers.Location);
        Assert.Equal(HttpStatusCode.OK, read.StatusCode); Assert.Contains(name, await read.Content.ReadAsStringAsync());
        Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsJsonAsync("/api/students", new { name, age = 20 })).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.PutAsJsonAsync(created.Headers.Location, new { name, age = 21 })).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.DeleteAsync(created.Headers.Location)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync(created.Headers.Location)).StatusCode);
    }
    [Theory]
    [InlineData("{\"name\":\"An\",\"age\":17}")]
    [InlineData("{\"name\":\"An\",\"age\":\"wrong\"}")]
    [InlineData("{\"name\":\"An\"}")]
    public async Task Invalid_Json_Returns_400_With_Errors(string json)
    {
        await using var factory = new LabFactory(); using var client = factory.CreateClient();
        using var body = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
        var response = await client.PostAsync("/api/students", body);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        Assert.Contains("errors", await response.Content.ReadAsStringAsync());
    }
    [Fact]
    public async Task Routing_MediaType_And_Manual_Validation()
    {
        await using var factory = new LabFactory(); using var client = factory.CreateClient();
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/api/students/abc")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/api/students/-1")).StatusCode);
        using var post = await client.PostAsJsonAsync("/api/students/5", new { name = "An", age = 20 });
        Assert.Equal(HttpStatusCode.MethodNotAllowed, post.StatusCode);
        Assert.NotEmpty(post.Content.Headers.Allow);
        Assert.Equal(HttpStatusCode.UnsupportedMediaType, (await client.PostAsync("/api/students", new StringContent("plain"))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/signup", new { name = "An", age = 17 })).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/signup", new { name = "An", age = 20 })).StatusCode);
    }
    [Fact]
    public async Task Roles_Ownership_And_Anonymous_Are_Independent()
    {
        await using var factory = new LabFactory(); using var client = factory.CreateClient();
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/admin")).StatusCode);
        client.DefaultRequestHeaders.Add("X-Test-User", "alice"); client.DefaultRequestHeaders.Add("X-Test-Role", "Reader");
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/admin")).StatusCode);
        client.DefaultRequestHeaders.Remove("X-Test-Role");client.DefaultRequestHeaders.Add("X-Test-Role", "Admin");
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/admin")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/mine/bob")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/mine/alice")).StatusCode);
    }
    [Fact]
    public async Task Razor_Encoding_Antiforgery_Invalid_Form_And_PRG()
    {
        await using var factory = new LabFactory();using var client=factory.CreateClient(new WebApplicationFactoryClientOptions{AllowAutoRedirect=false});
        Assert.Contains("&lt;An&gt;",await client.GetStringAsync("/students"));
        Assert.Equal(HttpStatusCode.BadRequest,(await client.PostAsync("/students/create",new FormUrlEncodedContent(new Dictionary<string,string>{{"Name","An"},{"Age","20"}}))).StatusCode);
        string html=await client.GetStringAsync("/students/create");
        string token=Regex.Match(html,"name=\"__RequestVerificationToken\"[^>]*value=\"([^\"]+)\"").Groups[1].Value;
        Assert.NotEmpty(token);
        var values=new Dictionary<string,string>{{"Name","An"},{"Age","17"},{"__RequestVerificationToken",token}};
        var invalid=await client.PostAsync("/students/create",new FormUrlEncodedContent(values));
        Assert.Equal(HttpStatusCode.OK,invalid.StatusCode);var invalidHtml=await invalid.Content.ReadAsStringAsync();Assert.Contains("value=\"17\"",invalidHtml);Assert.Contains("validation-summary-errors",invalidHtml);
        values["Age"]="20";var valid=await client.PostAsync("/students/create",new FormUrlEncodedContent(values));
        Assert.Equal(HttpStatusCode.Found,valid.StatusCode);Assert.NotNull(valid.Headers.Location);
    }
    [Fact]
    public async Task Pipeline_StaticFiles_ProblemDetails_Config_And_ETag()
    {
        await using var factory=new LabFactory();using var client=factory.CreateClient();factory.Logs.Entries.Clear();
        Assert.Equal("endpoint",await client.GetStringAsync("/pipeline"));
        Assert.Equal(new[]{"A-in","B-in","endpoint","B-out","A-out"},factory.Logs.Entries.Select(s=>s.Split(' ')[0]).ToArray());
        Assert.Equal(HttpStatusCode.Forbidden,(await client.GetAsync("/blocked")).StatusCode);
        Assert.Equal(HttpStatusCode.OK,(await client.GetAsync("/site.css")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound,(await client.GetAsync("/Private/internal.txt")).StatusCode);
        var error=await client.GetAsync("/boom");Assert.Equal(HttpStatusCode.InternalServerError,error.StatusCode);var body=await error.Content.ReadAsStringAsync();Assert.Contains("traceId",body);Assert.DoesNotContain("Internal lab detail",body);
        Assert.Contains("TestLab",await client.GetStringAsync("/config"));
        var etag=await client.GetAsync("/etag");Assert.NotNull(etag.Headers.ETag);
        using var conditional=new HttpRequestMessage(HttpMethod.Get,"/etag");conditional.Headers.IfNoneMatch.Add(etag.Headers.ETag!);
        Assert.Equal(HttpStatusCode.NotModified,(await client.SendAsync(conditional)).StatusCode);
    }
    [Fact]
    public async Task Identity_Framework_Register_Login_Refresh_And_Cookie_Challenge()
    {
        await using var factory=new LabFactory(fakeAuth:false);using var client=factory.CreateClient(new WebApplicationFactoryClientOptions{AllowAutoRedirect=false});
        string email="local-"+Guid.NewGuid().ToString("N")+"@example.test";const string password="Local-demo-only-42!";
        Assert.Equal(HttpStatusCode.OK,(await client.PostAsJsonAsync("/identity/register",new{email,password})).StatusCode);
        var login=await client.PostAsJsonAsync("/identity/login?useCookies=false",new{email,password});Assert.Equal(HttpStatusCode.OK,login.StatusCode);
        var token=await login.Content.ReadFromJsonAsync<TokenReply>();Assert.NotNull(token);Assert.False(string.IsNullOrEmpty(token.AccessToken));
        client.DefaultRequestHeaders.Authorization=new("Bearer",token.AccessToken);
        Assert.Equal(HttpStatusCode.OK,(await client.GetAsync("/identity/manage/info")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden,(await client.GetAsync("/admin")).StatusCode);
        var refresh=await client.PostAsJsonAsync("/identity/refresh",new{refreshToken=token.RefreshToken});Assert.Equal(HttpStatusCode.OK,refresh.StatusCode);
        client.DefaultRequestHeaders.Authorization=new("Bearer","invalid-token");Assert.Equal(HttpStatusCode.Unauthorized,(await client.GetAsync("/identity/manage/info")).StatusCode);
        client.DefaultRequestHeaders.Authorization=null;
        Assert.Equal(HttpStatusCode.OK,(await client.PostAsJsonAsync("/identity/login?useCookies=true",new{email,password})).StatusCode);
        Assert.Equal(HttpStatusCode.OK,(await client.GetAsync("/identity/manage/info")).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent,(await client.PostAsync("/identity/logout",null)).StatusCode);
    }
    private sealed record TokenReply(string AccessToken,string RefreshToken);
}
public sealed class LabFactory(bool fakeAuth=true):WebApplicationFactory<Program>
{
    private readonly string dbFile=Path.Combine(Path.GetTempPath(),"ddl-test-"+Guid.NewGuid().ToString("N")+".db");
    public readonly RecordedLogs Logs=new();
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((_,c)=>c.AddInMemoryCollection(new Dictionary<string,string?>{{"Lab:Name","TestLab"},{"Lab:Database",dbFile}}));
        builder.ConfigureTestServices(services=>
        {
            services.AddLogging(b=>b.AddProvider(Logs));
            if(fakeAuth)services.AddAuthentication(o=>{o.DefaultAuthenticateScheme="Test";o.DefaultChallengeScheme="Test";o.DefaultForbidScheme="Test";}).AddScheme<AuthenticationSchemeOptions,TestAuthHandler>("Test",_=>{});
        });
    }
    public override async ValueTask DisposeAsync(){await base.DisposeAsync();Microsoft.Data.Sqlite.SqliteConnection.ClearAllPools();if(File.Exists(dbFile))File.Delete(dbFile);}
}
// This handler exists only in the test assembly; the web project never trusts these headers.
public sealed class TestAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options,ILoggerFactory logs,UrlEncoder encoder):AuthenticationHandler<AuthenticationSchemeOptions>(options,logs,encoder)
{
 protected override Task<AuthenticateResult> HandleAuthenticateAsync()
 {
  if(!Request.Headers.TryGetValue("X-Test-User",out var user))return Task.FromResult(AuthenticateResult.NoResult());
  var claims=new List<Claim>{new(ClaimTypes.NameIdentifier,user.ToString())};if(Request.Headers.TryGetValue("X-Test-Role",out var role))claims.Add(new(ClaimTypes.Role,role.ToString()));
  return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(new ClaimsIdentity(claims,"Test")),"Test")));
 }
}
public sealed class RecordedLogs:ILoggerProvider
{
 public ConcurrentQueue<string> Entries=new();public ILogger CreateLogger(string name)=>new Recorder(name,Entries);public void Dispose(){}
 private sealed class Recorder(string category,ConcurrentQueue<string> entries):ILogger
 {public IDisposable? BeginScope<TState>(TState state)where TState:notnull=>null;public bool IsEnabled(LogLevel level)=>true;public void Log<TState>(LogLevel level,EventId id,TState state,Exception? ex,Func<TState,Exception?,string> format){if(category=="PipelineLab")entries.Enqueue(format(state,ex));}}
}
