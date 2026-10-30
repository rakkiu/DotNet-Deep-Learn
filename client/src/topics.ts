export const topicName = (id: string) =>
  ({
    csharp: "C# căn bản",
    oop: "Hướng đối tượng",
    linq: "LINQ",
    sql: "SQL",
    efcore: "EF Core",
    aspnet: "ASP.NET Core",
    solid: "Thiết kế ứng dụng",
    io: "Stream và file",
    async: "Bất đồng bộ",
    network: "Mạng và HTTP",
  })[id] ?? id;
