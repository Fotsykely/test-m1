using System.Text.Json.Serialization;

namespace Api.Entities;

// In JSON, the status travels as text ("Active") rather than a number,
// both in request/response bodies and in the OpenAPI documentation.
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ItemStatus
{
    Draft,
    Active,
    Archived,
}
