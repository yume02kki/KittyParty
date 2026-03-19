namespace KittyParty.Api.Models;

public class TrafficLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid MissionId { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public CapturedRequest Request { get; set; } = new();
    public CapturedResponse MainResponse { get; set; } = new();
    public CapturedResponse DevResponse { get; set; } = new();
    public ComparisonResult Comparison { get; set; } = new();
}

public class CapturedRequest
{
    public string Method { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;
    public string? QueryString { get; set; }
    public Dictionary<string, string> Headers { get; set; } = new();
    public string? Body { get; set; }
}

public class CapturedResponse
{
    public int StatusCode { get; set; }
    public Dictionary<string, string> Headers { get; set; } = new();
    public string? Body { get; set; }
    public long LatencyMs { get; set; }
}

public class ComparisonResult
{
    public bool StatusMatch { get; set; }
    public bool BodyMatch { get; set; }
    public long LatencyDifferenceMs { get; set; }
    public List<string> Differences { get; set; } = new();
}
