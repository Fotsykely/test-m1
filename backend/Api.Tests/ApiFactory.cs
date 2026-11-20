using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Testcontainers.MySql;

namespace Api.Tests;

// Starts a throwaway MySQL container (Docker must be running) and points the API at it.
// A real MySQL is used on purpose: the migrations are specific to Pomelo, so SQLite or the
// in-memory provider would not exercise the same schema.
public class ApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly MySqlContainer _database = new MySqlBuilder("mysql:8.4").Build();

    // Explicit implementations: WebApplicationFactory already has its own ValueTask-returning DisposeAsync.
    Task IAsyncLifetime.InitializeAsync() => _database.StartAsync();

    Task IAsyncLifetime.DisposeAsync() => _database.DisposeAsync().AsTask();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // UseSetting is read by Program.cs before the app is built, unlike ConfigureAppConfiguration.
        builder.UseSetting("ConnectionStrings:Default", _database.GetConnectionString());
    }
}

// One container for the whole test run: every test class that joins this collection shares it.
[CollectionDefinition(Name)]
public class ApiCollection : ICollectionFixture<ApiFactory>
{
    public const string Name = "Api";
}
