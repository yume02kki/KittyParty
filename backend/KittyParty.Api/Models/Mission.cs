namespace KittyParty.Api.Models;

public class Mission
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string MainApiUrl { get; set; } = string.Empty;
    public string DevApiUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<IgnoreRule> IgnoreRules { get; set; } = new();
}

public class IgnoreRule
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Pattern { get; set; } = string.Empty;
    public string? Replacement { get; set; }
    public string? Description { get; set; }
}

public class CreateMissionRequest
{
    public string Name { get; set; } = string.Empty;
    public string MainApiUrl { get; set; } = string.Empty;
    public string DevApiUrl { get; set; } = string.Empty;
}

public class AddIgnoreRuleRequest
{
    public string Pattern { get; set; } = string.Empty;
    public string? Replacement { get; set; }
    public string? Description { get; set; }
}
