using System.Net;
using System.Net.Http.Json;
using Api.Dtos;

namespace Api.Tests;

[Collection(ApiCollection.Name)]
public class RoomsEndpointsTests(ApiFactory factory)
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Rooms_are_the_six_rooms_of_the_subject_in_order()
    {
        var rooms = await _client.GetFromJsonAsync<List<RoomDto>>("/api/rooms");

        Assert.Equal(
            ["Amphi A", "Amphi B", "Salle 1", "Salle 2", "Labo", "Conférence"],
            rooms!.Select(r => r.Name));
    }

    [Fact]
    public async Task A_room_can_be_read_by_id()
    {
        var room = await _client.GetFromJsonAsync<RoomDto>("/api/rooms/5");

        Assert.Equal(new RoomDto(5, "Labo"), room);
    }

    [Fact]
    public async Task Reading_an_unknown_room_answers_404()
    {
        var response = await _client.GetAsync("/api/rooms/999999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
