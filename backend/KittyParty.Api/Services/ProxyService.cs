using System.Diagnostics;
using KittyParty.Api.Models;

namespace KittyParty.Api.Services;

public class ProxyService
{
    private readonly HttpClient _httpClient;
    private readonly StorageService _storage;
    private readonly ComparisonService _comparison;

    public ProxyService(HttpClient httpClient, StorageService storage, ComparisonService comparison)
    {
        _httpClient = httpClient;
        _storage = storage;
        _comparison = comparison;
    }

    public async Task<(CapturedResponse mainResponse, TrafficLog log)?> ForwardAsync(
        Guid missionId, string path, CapturedRequest capturedRequest)
    {
        var mission = _storage.GetMission(missionId);
        if (mission == null) return null;

        var mainTask = SendRequestAsync(mission.MainApiUrl, path, capturedRequest);
        var devTask = SendRequestAsync(mission.DevApiUrl, path, capturedRequest);
        await Task.WhenAll(mainTask, devTask);

        var mainResp = await mainTask;
        var devResp = await devTask;
        var comparison = _comparison.Compare(mainResp, devResp, mission.IgnoreRules);

        var log = new TrafficLog
        {
            MissionId = missionId,
            Request = capturedRequest,
            MainResponse = mainResp,
            DevResponse = devResp,
            Comparison = comparison
        };

        _storage.AddLog(log);
        return (mainResp, log);
    }

    public async Task<TrafficLog?> ReplayAsync(Guid logId)
    {
        var originalLog = _storage.GetLog(logId);
        if (originalLog == null) return null;

        var mission = _storage.GetMission(originalLog.MissionId);
        if (mission == null) return null;

        var req = originalLog.Request;
        var mainTask = SendRequestAsync(mission.MainApiUrl, req.Path, req);
        var devTask = SendRequestAsync(mission.DevApiUrl, req.Path, req);
        await Task.WhenAll(mainTask, devTask);

        var mainResp = await mainTask;
        var devResp = await devTask;
        var comparison = _comparison.Compare(mainResp, devResp, mission.IgnoreRules);

        var log = new TrafficLog
        {
            MissionId = originalLog.MissionId,
            Request = req,
            MainResponse = mainResp,
            DevResponse = devResp,
            Comparison = comparison
        };

        _storage.AddLog(log);
        return log;
    }

    private async Task<CapturedResponse> SendRequestAsync(string baseUrl, string path, CapturedRequest req)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            var url = $"{baseUrl}/{path}";
            if (!string.IsNullOrEmpty(req.QueryString))
                url += $"?{req.QueryString}";

            var message = new HttpRequestMessage(new HttpMethod(req.Method), url);
            foreach (var h in req.Headers)
            {
                if (h.Key.Equals("Host", StringComparison.OrdinalIgnoreCase)) continue;
                if (h.Key.Equals("Content-Length", StringComparison.OrdinalIgnoreCase)) continue;
                if (h.Key.Equals("Transfer-Encoding", StringComparison.OrdinalIgnoreCase)) continue;
                message.Headers.TryAddWithoutValidation(h.Key, h.Value);
            }

            if (req.Body != null && req.Method != "GET" && req.Method != "HEAD")
            {
                message.Content = new StringContent(req.Body);
                var contentType = req.Headers.GetValueOrDefault("Content-Type", "application/json");
                message.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(
                    contentType.Split(';')[0].Trim());
            }

            var response = await _httpClient.SendAsync(message);
            sw.Stop();

            var body = await response.Content.ReadAsStringAsync();
            var headers = response.Headers
                .Concat(response.Content.Headers)
                .ToDictionary(h => h.Key, h => string.Join(", ", h.Value));

            return new CapturedResponse
            {
                StatusCode = (int)response.StatusCode,
                Headers = headers,
                Body = body,
                LatencyMs = sw.ElapsedMilliseconds
            };
        }
        catch (Exception ex)
        {
            sw.Stop();
            return new CapturedResponse
            {
                StatusCode = 0,
                Body = $"Error: {ex.Message}",
                LatencyMs = sw.ElapsedMilliseconds
            };
        }
    }
}
