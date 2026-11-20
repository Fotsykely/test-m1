using System.ComponentModel.DataAnnotations;
using Api.Entities;

namespace Api.Dtos;

// Request body for POST and PUT. The validation attributes are picked up automatically
// by [ApiController]: invalid input returns a 400 with one message list per field.
public class ItemRequestDto
{
    private string? _name;
    private string? _description;

    [Required(ErrorMessage = "Le nom est obligatoire.")]
    [StringLength(Item.NameMaxLength, MinimumLength = Item.NameMinLength,
        ErrorMessage = "Le nom doit contenir entre {2} et {1} caractères.")]
    public string? Name
    {
        get => _name;
        set => _name = value?.Trim(); // " ab " counts as 2 characters, not 4
    }

    [StringLength(Item.DescriptionMaxLength,
        ErrorMessage = "La description ne peut pas dépasser {1} caractères.")]
    public string? Description
    {
        get => _description;
        set => _description = string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    // Enum values are checked by the JSON deserializer: an unknown status is a 400 as well.
    public ItemStatus Status { get; set; } = ItemStatus.Draft;
}

// Response for a single item, also used for the list.
public record ItemDto(int Id, string Name, string? Description, ItemStatus Status, DateTime CreatedAt);
