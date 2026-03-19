using System.Text.RegularExpressions;
using KittyParty.Api.Models;

namespace KittyParty.Api.Services;

public class ComparisonService
{
    public ComparisonResult Compare(CapturedResponse main, CapturedResponse dev, List<IgnoreRule> rules)
    {
        var result = new ComparisonResult
        {
            StatusMatch = main.StatusCode == dev.StatusCode,
            LatencyDifferenceMs = dev.LatencyMs - main.LatencyMs
        };

        if (!result.StatusMatch)
            result.Differences.Add($"Status: Main={main.StatusCode}, Dev={dev.StatusCode}");

        var mainBody = ApplyIgnoreRules(main.Body ?? "", rules);
        var devBody = ApplyIgnoreRules(dev.Body ?? "", rules);

        result.BodyMatch = mainBody == devBody;

        if (!result.BodyMatch)
        {
            var diffs = ComputeLineDiffs(mainBody, devBody);
            result.Differences.AddRange(diffs);
        }

        if (Math.Abs(result.LatencyDifferenceMs) > 100)
            result.Differences.Add($"Latency: Main={main.LatencyMs}ms, Dev={dev.LatencyMs}ms (diff={result.LatencyDifferenceMs}ms)");

        return result;
    }

    public static string ApplyIgnoreRules(string body, List<IgnoreRule> rules)
    {
        foreach (var rule in rules)
        {
            try
            {
                var regex = new Regex(rule.Pattern, RegexOptions.None, TimeSpan.FromSeconds(1));
                body = regex.Replace(body, rule.Replacement ?? "***IGNORED***");
            }
            catch (RegexParseException) { }
        }
        return body;
    }

    private static List<string> ComputeLineDiffs(string main, string dev)
    {
        var diffs = new List<string>();
        var mainLines = main.Split('\n');
        var devLines = dev.Split('\n');
        var maxLines = Math.Max(mainLines.Length, devLines.Length);

        for (int i = 0; i < maxLines; i++)
        {
            var mainLine = i < mainLines.Length ? mainLines[i] : "<missing>";
            var devLine = i < devLines.Length ? devLines[i] : "<missing>";
            if (mainLine != devLine)
                diffs.Add($"Line {i + 1}: Main=\"{Truncate(mainLine, 200)}\" | Dev=\"{Truncate(devLine, 200)}\"");
        }

        if (diffs.Count > 50)
        {
            var count = diffs.Count;
            diffs = diffs.Take(50).ToList();
            diffs.Add($"... and {count - 50} more differences");
        }
        return diffs;
    }

    private static string Truncate(string s, int max) =>
        s.Length <= max ? s : s[..max] + "...";
}
