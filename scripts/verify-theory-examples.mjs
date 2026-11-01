// Compile the documented C# examples in isolated, ignored directories.
// Requires .NET 10 SDK and NuGet access; never writes to a global package cache.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(
  fs.readFileSync(path.join(root, "client/src/data/theory.json"), "utf8"),
);
data.lessons = data.lessons.map((l) => JSON.parse(fs.readFileSync(path.join(root, "client/src/data/articles", `${l.id}.json`), "utf8")));
const work = path.join(root, ".tools/theory-examples");
fs.mkdirSync(work, { recursive: true });
const env = {
  ...process.env,
  DOTNET_CLI_HOME: path.join(work, "cli-home"),
  NUGET_PACKAGES: path.join(work, "nuget"),
  DOTNET_SKIP_FIRST_TIME_EXPERIENCE: "1",
  DOTNET_CLI_TELEMETRY_OPTOUT: "1",
  MSBuildEnableWorkloadResolver: "false",
};
const exec = (args, cwd, timeout = 90000) =>
  new Promise((resolve) => {
    const child = spawn("dotnet", args, { cwd, env, windowsHide: true });
    let out = "";
    child.stdout.on("data", (c) => (out += c));
    child.stderr.on("data", (c) => (out += c));
    const timer = setTimeout(() => child.kill(), timeout);
    child.on("error", (e) => {
      clearTimeout(timer);
      resolve({ code: 1, out: String(e) });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, out });
    });
  });
const selected = new Set(process.argv.slice(2));
const reportFile = path.join(root, "docs/example-verification.json");
const results =
  selected.size && fs.existsSync(reportFile)
    ? JSON.parse(fs.readFileSync(reportFile, "utf8")).results.filter(
        (r) => !selected.has(r.id),
      )
    : [];
for (const l of data.lessons) {
  if (selected.size && !selected.has(l.id)) continue;
  const h = l.sections.find((s) => s.id === "hello").hello;
  if (h.language !== "csharp") {
    results.push({ id: l.id, status: "not-csharp" });
    continue;
  }
  const dir = path.join(work, l.id);
  fs.mkdirSync(dir, { recursive: true });
  const web = h.setup.includes("dotnet new web "),
    ef = h.setup.includes("EntityFrameworkCore"),
    framework = h.setup.includes("FrameworkReference"),
    tests = l.id === "unit-testing";
  const refs = [
    ef
      ? '<PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="10.0.0" />'
      : "",
    framework
      ? '<FrameworkReference Include="Microsoft.AspNetCore.App" />'
      : "",
    tests ? '<PackageReference Include="xunit" Version="2.9.3" />' : "",
  ]
    .filter(Boolean)
    .join("");
  fs.writeFileSync(
    path.join(dir, "Example.csproj"),
    `<Project Sdk="Microsoft.NET.Sdk${web ? ".Web" : ""}"><PropertyGroup><TargetFramework>net10.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable>${tests ? "" : "<OutputType>Exe</OutputType>"}</PropertyGroup><ItemGroup>${refs}</ItemGroup></Project>`,
  );
  fs.writeFileSync(path.join(dir, h.file), h.code);
  for (const [name, text] of Object.entries(h.files)) {
    const file = path.join(dir, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text);
  }
  const build = await exec(
    [
      "build",
      "Example.csproj",
      "--nologo",
      "-v",
      "quiet",
      ...(process.env.THEORY_NUGET_SOURCE
        ? ["--source", process.env.THEORY_NUGET_SOURCE]
        : []),
    ],
    dir,
  );
  let result = {
    id: l.id,
    status: build.code === 0 ? "compiled" : "failed",
    detail: build.code === 0 ? "" : build.out,
  };
  if (build.code === 0 && !web && !tests && l.id !== "efcore-migrations") {
    const run = await exec(
      ["run", "--no-build", "--project", "Example.csproj"],
      dir,
      15000,
    );
    result = {
      ...result,
      status: run.code === 0 ? "ran" : "failed",
      detail: run.out.trim(),
    };
  }
  results.push(result);
  console.log(
    `${result.status}: ${l.id}${result.status === "failed" ? "\n" + result.detail : ""}`,
  );
}
results.sort(
  (a, b) =>
    data.lessons.findIndex((l) => l.id === a.id) -
    data.lessons.findIndex((l) => l.id === b.id),
);
fs.writeFileSync(
  reportFile,
  JSON.stringify({ sdkTarget: "net10.0", results }, null, 2) + "\n",
);
if (results.some((r) => r.status === "failed")) process.exitCode = 1;
