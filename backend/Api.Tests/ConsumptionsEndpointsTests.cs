using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Api.Dtos;

namespace Api.Tests;

// The database is shared by every test of the run: each test uses its own year so that
// the entries of one test never show up in the filters or sums of another.
[Collection(ApiCollection.Name)]
public class ConsumptionsEndpointsTests(ApiFactory factory)
{
    private const int AmphiA = 1;
    private const int AmphiB = 2;

    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Created_consumption_can_be_read_back()
    {
        var created = await CreateAsync(AmphiA, 2031, 3, jirama: 100.5m, solar: 20, generator: 0);

        var consumption = await _client.GetFromJsonAsync<ConsumptionDto>($"/api/consumptions/{created.Id}");

        Assert.Equal(
            new ConsumptionDto(created.Id, AmphiA, "Amphi A", 2031, 3, 100.5m, 20m, 0m),
            consumption);
    }

    [Fact]
    public async Task Values_are_rounded_to_two_decimals()
    {
        var created = await CreateAsync(AmphiA, 2032, 1, jirama: 10.126m, solar: 0.004m, generator: 1);

        Assert.Equal(10.13m, created.JiramaKwh);
        Assert.Equal(0m, created.SolarKwh);
    }

    [Fact]
    public async Task Creating_without_values_answers_400_with_a_message_per_field()
    {
        var response = await _client.PostAsJsonAsync("/api/consumptions", new { roomId = AmphiA, year = 2033, month = 1 });

        await AssertBadRequestOnAsync(response, "JiramaKwh", "SolarKwh", "GeneratorKwh");
    }

    [Fact]
    public async Task Negative_values_answer_400()
    {
        var response = await PostAsync(AmphiA, 2034, 1, jirama: -0.4m, solar: 0, generator: 0);

        await AssertBadRequestOnAsync(response, "JiramaKwh");
    }

    [Fact]
    public async Task A_month_or_a_year_out_of_range_answers_400()
    {
        var response = await PostAsync(AmphiA, year: 1999, month: 13, jirama: 1, solar: 1, generator: 1);

        await AssertBadRequestOnAsync(response, "Year", "Month");
    }

    [Fact]
    public async Task An_unknown_room_answers_400_on_the_room_field()
    {
        var response = await PostAsync(roomId: 999999, 2035, 1, jirama: 1, solar: 1, generator: 1);

        await AssertBadRequestOnAsync(response, "RoomId");
    }

    [Fact]
    public async Task A_second_entry_for_the_same_room_and_month_answers_409_and_keeps_the_first()
    {
        var first = await CreateAsync(AmphiA, 2036, 5, jirama: 1, solar: 2, generator: 3);

        var second = await PostAsync(AmphiA, 2036, 5, jirama: 9, solar: 9, generator: 9);

        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
        var entries = await _client.GetFromJsonAsync<List<ConsumptionDto>>("/api/consumptions?year=2036");
        Assert.Equal([first], entries);
    }

    [Fact]
    public async Task Updating_changes_the_values_only()
    {
        var created = await CreateAsync(AmphiA, 2037, 7, jirama: 1, solar: 2, generator: 3);

        var response = await _client.PutAsJsonAsync($"/api/consumptions/{created.Id}",
            new { jiramaKwh = 10, solarKwh = 20.5, generatorKwh = 30, roomId = AmphiB, year = 2000, month = 1 });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            new ConsumptionDto(created.Id, AmphiA, "Amphi A", 2037, 7, 10m, 20.5m, 30m),
            await response.Content.ReadFromJsonAsync<ConsumptionDto>());
    }

    [Fact]
    public async Task Updating_with_an_invalid_value_answers_400_and_an_unknown_entry_answers_404()
    {
        var created = await CreateAsync(AmphiA, 2038, 1, jirama: 1, solar: 2, generator: 3);

        var invalid = await _client.PutAsJsonAsync($"/api/consumptions/{created.Id}",
            new { jiramaKwh = -1, solarKwh = 2, generatorKwh = 3 });
        var unknown = await _client.PutAsJsonAsync("/api/consumptions/999999",
            new { jiramaKwh = 1, solarKwh = 2, generatorKwh = 3 });

        await AssertBadRequestOnAsync(invalid, "JiramaKwh");
        Assert.Equal(HttpStatusCode.NotFound, unknown.StatusCode);
    }

    [Fact]
    public async Task Deleting_an_entry_answers_204_then_404()
    {
        var created = await CreateAsync(AmphiA, 2039, 1, jirama: 1, solar: 2, generator: 3);

        var first = await _client.DeleteAsync($"/api/consumptions/{created.Id}");
        var second = await _client.DeleteAsync($"/api/consumptions/{created.Id}");

        Assert.Equal(HttpStatusCode.NoContent, first.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, second.StatusCode);
    }

    [Fact]
    public async Task The_list_can_be_filtered_by_year_month_and_room_and_starts_with_the_newest_period()
    {
        var a1 = await CreateAsync(AmphiA, 2040, 1, jirama: 1, solar: 1, generator: 1);
        var b1 = await CreateAsync(AmphiB, 2040, 1, jirama: 2, solar: 2, generator: 2);
        var a2 = await CreateAsync(AmphiA, 2040, 2, jirama: 3, solar: 3, generator: 3);

        Assert.Equal([a2, a1, b1], await GetListAsync("year=2040"));
        Assert.Equal([a1, b1], await GetListAsync("year=2040&month=1"));
        Assert.Equal([b1], await GetListAsync($"year=2040&roomId={AmphiB}"));
    }

    [Theory]
    [InlineData("/api/consumptions?month=13")]
    [InlineData("/api/consumptions?year=1999")]
    public async Task A_filter_out_of_range_answers_400(string url)
    {
        var response = await _client.GetAsync(url);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task The_summary_adds_up_every_month_of_each_room()
    {
        // The other tests leave entries in the shared database: compare with the summary taken before.
        // The tests of a collection run one after the other, so nothing else changes in between.
        var before = await GetSummaryAsync();

        await CreateAsync(AmphiA, 2041, 1, jirama: 100, solar: 10, generator: 5);
        await CreateAsync(AmphiA, 2042, 2, jirama: 50.5m, solar: 0, generator: 5);
        await CreateAsync(AmphiB, 2041, 1, jirama: 1, solar: 2, generator: 3);

        var after = await GetSummaryAsync();

        Assert.Equal(6, after.Count);
        AssertAdded(before[0], after[0], jirama: 150.5m, solar: 10m, generator: 10m);
        AssertAdded(before[1], after[1], jirama: 1m, solar: 2m, generator: 3m);
        Assert.Equal(before.Skip(2), after.Skip(2));
    }

    [Fact]
    public async Task The_summary_lists_the_six_rooms_in_order()
    {
        var summary = await GetSummaryAsync();

        Assert.Equal(
            ["Amphi A", "Amphi B", "Salle 1", "Salle 2", "Labo", "Conférence"],
            summary.Select(r => r.RoomName));
    }

    private Task<HttpResponseMessage> PostAsync(
        int roomId, int year, int month, decimal jirama, decimal solar, decimal generator) =>
        _client.PostAsJsonAsync("/api/consumptions", new
        {
            roomId,
            year,
            month,
            jiramaKwh = jirama,
            solarKwh = solar,
            generatorKwh = generator,
        });

    private async Task<ConsumptionDto> CreateAsync(
        int roomId, int year, int month, decimal jirama, decimal solar, decimal generator)
    {
        var response = await PostAsync(roomId, year, month, jirama, solar, generator);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return (await response.Content.ReadFromJsonAsync<ConsumptionDto>())!;
    }

    private async Task<List<ConsumptionDto>> GetListAsync(string query) =>
        (await _client.GetFromJsonAsync<List<ConsumptionDto>>($"/api/consumptions?{query}"))!;

    private async Task<List<RoomSummaryDto>> GetSummaryAsync() =>
        (await _client.GetFromJsonAsync<List<RoomSummaryDto>>("/api/consumptions/summary"))!;

    private static void AssertAdded(
        RoomSummaryDto before, RoomSummaryDto after, decimal jirama, decimal solar, decimal generator)
    {
        Assert.Equal(before.JiramaKwh + jirama, after.JiramaKwh);
        Assert.Equal(before.SolarKwh + solar, after.SolarKwh);
        Assert.Equal(before.GeneratorKwh + generator, after.GeneratorKwh);
        Assert.Equal(after.JiramaKwh + after.SolarKwh + after.GeneratorKwh, after.TotalKwh);
    }

    // The 400 body lists the invalid fields under "errors", each with at least one message.
    private static async Task AssertBadRequestOnAsync(HttpResponseMessage response, params string[] fields)
    {
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        var errors = problem.GetProperty("errors");
        foreach (var field in fields)
        {
            Assert.True(errors.TryGetProperty(field, out var messages), $"no error for {field}");
            Assert.NotEmpty(messages.EnumerateArray());
        }
    }
}
