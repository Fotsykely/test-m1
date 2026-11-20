using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Api.Dtos;
using Api.Entities;

namespace Api.Tests;

[Collection(ApiCollection.Name)]
public class ItemsEndpointsTests(ApiFactory factory)
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Created_item_can_be_read_back()
    {
        var created = await CreateItemAsync("Item to read back");

        var response = await _client.GetAsync($"/api/items/{created.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var item = await response.Content.ReadFromJsonAsync<ItemDto>();
        Assert.Equal("Item to read back", item!.Name);
        Assert.Equal(ItemStatus.Active, item.Status);
    }

    [Fact]
    public async Task Creating_an_item_without_a_name_answers_400_with_a_message_for_the_name_field()
    {
        var response = await _client.PostAsJsonAsync("/api/items", new { name = "", status = "Draft" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(problem.GetProperty("errors").TryGetProperty("Name", out var messages));
        Assert.NotEmpty(messages.EnumerateArray());
    }

    [Fact]
    public async Task Reading_an_unknown_item_answers_404()
    {
        var response = await _client.GetAsync("/api/items/999999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Updated_item_keeps_its_new_values()
    {
        var created = await CreateItemAsync("Before update");

        var response = await _client.PutAsJsonAsync($"/api/items/{created.Id}",
            new { name = "After update", description = "New description", status = "Archived" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var item = await response.Content.ReadFromJsonAsync<ItemDto>();
        Assert.Equal("After update", item!.Name);
        Assert.Equal(ItemStatus.Archived, item.Status);
    }

    [Fact]
    public async Task Deleting_an_item_answers_204_then_404()
    {
        var created = await CreateItemAsync("Item to delete");

        var first = await _client.DeleteAsync($"/api/items/{created.Id}");
        var second = await _client.DeleteAsync($"/api/items/{created.Id}");

        Assert.Equal(HttpStatusCode.NoContent, first.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, second.StatusCode);
    }

    private async Task<ItemDto> CreateItemAsync(string name)
    {
        var response = await _client.PostAsJsonAsync("/api/items", new { name, status = "Active" });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return (await response.Content.ReadFromJsonAsync<ItemDto>())!;
    }
}
