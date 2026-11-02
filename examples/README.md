# Local .NET theory labs

Reviewed 2026-11-01: SDK **10.0.403**, `net10.0`, C# 14; runtime, ASP.NET Core, EF Core and dotnet-ef **10.0.14**. Tests use xUnit v2 **2.9.3**, runner.visualstudio **3.1.5**, Test SDK **17.14.1**. Install the SDK before running. Run commands from the repository/ZIP root, not from inside `examples`.

```shell
dotnet --info
dotnet test examples/WebLab.Tests/WebLab.Tests.csproj
dotnet run --project examples/DataLab/DataLab.csproj
dotnet run --project examples/WebLab/WebLab.csproj -- --urls http://127.0.0.1:5090
```

WebLab demonstrates MVC, model binding, validation, CRUD HTTP contracts, middleware unwind, static file boundaries, ProblemDetails, ETag, Identity API and authorization. Start at `/students`, `/api/students`, `/pipeline`, `/config`, `/health/ready`. Data is fake and local. The in-memory student dictionary is intentionally a small HTTP lab; production concurrency/uniqueness requires a real persistent store. Identity uses SQLite and ephemeral Data Protection keys for isolation. It is **not** production key, HTTPS or secret configuration. `X-Test-*` authentication only exists in the test assembly.

Tests create their own SQLite database and remove it at factory disposal. For an interactive WebLab run, choose an empty temporary directory yourself and set `Lab__Database` to a database file inside it if you want to control cleanup; stop the app before deleting that owned file. Never point a lab at a personal or production database. DataLab always creates and cleans its own temporary database. SQLite behavior does not certify SQL Server isolation, query plans or rowversion semantics.

## Two migrations, retaining an existing row

Copy MigrationLab to a new working directory first. The commands below assume the original repository layout; replace `examples/MigrationLab/MigrationLab.csproj` if using a copy. Do not use `EnsureCreated` for this flow.

```shell
dotnet new tool-manifest
dotnet tool install dotnet-ef --version 10.0.14
dotnet ef migrations add InitialCreate --project examples/MigrationLab/MigrationLab.csproj
dotnet ef migrations script 0 InitialCreate --project examples/MigrationLab/MigrationLab.csproj --output initial.sql
dotnet ef database update --project examples/MigrationLab/MigrationLab.csproj
dotnet run --project examples/MigrationLab/MigrationLab.csproj
```

The first run prints `students:1` and `name:An`. In `SchoolContext.cs`, add `public string Email { get; set; } = "";` to `Student`. Then:

```shell
dotnet ef migrations add AddEmail --project examples/MigrationLab/MigrationLab.csproj
dotnet ef migrations script InitialCreate AddEmail --project examples/MigrationLab/MigrationLab.csproj --output add-email.sql
dotnet ef database update --project examples/MigrationLab/MigrationLab.csproj
dotnet run --project examples/MigrationLab/MigrationLab.csproj
```

Review `add-email.sql` before applying. The row must still be `An`, count 1; the new non-null column has a default for existing rows. MigrationLab's `school.db` is relative to the working directory, so use the same directory for `ef` and `run`. The automatic verifier copies the project, runs both migrations, checks the database schema/row and saves the result in `docs/upgrade-lab-results.json`.

## Publish smoke check

```shell
dotnet publish examples/WebLab/WebLab.csproj -c Release --self-contained false -o .tools/published-web
cd .tools/published-web
dotnet WebLab.dll --urls http://127.0.0.1:5091
```

Run the published DLL from its output directory so `appsettings.json` and static content are found. Check `/` and `/health/ready`; stop with Ctrl+C. Framework-dependent output needs a compatible runtime. Publishing successfully is not evidence of a production deployment or a vulnerability audit.

See `scripts/verify-upgrade.mjs`, `scripts/verify-upgrade-labs.mjs` and `docs/upgrade-coverage.md` for exact assertions, observed outcomes and remaining limits. The reading app executes no C# in the browser and provides no scores or submission system.


## OOP theory projects

Build the reading app (`npm --prefix client run build`) to generate the downloadable ZIP. Its `examples/OopLab/` directory contains 16 independent projects generated directly from the four OOP articles. Each has source/configuration, expected output and a README. Twelve run without external services. Four are intentional compile-error projects, isolated from `Labs.slnx`. They demonstrate CS0272, CS0144, CS0509 and CS0506; they must not be mixed into a build that expects success. The canonical source remains the article JSON, so changing article code changes the packaged project on the next build.
