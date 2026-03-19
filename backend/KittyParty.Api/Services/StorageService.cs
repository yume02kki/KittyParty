using System.Collections.Concurrent;
using KittyParty.Api.Models;

namespace KittyParty.Api.Services;

public class StorageService
{
    private readonly ConcurrentDictionary<Guid, Mission> _missions = new();
    private readonly ConcurrentDictionary<Guid, TrafficLog> _logs = new();

    public Mission CreateMission(CreateMissionRequest req)
    {
        var mission = new Mission
        {
            Name = req.Name,
            MainApiUrl = req.MainApiUrl.TrimEnd('/'),
            DevApiUrl = req.DevApiUrl.TrimEnd('/')
        };
        _missions[mission.Id] = mission;
        return mission;
    }

    public List<Mission> GetMissions() => _missions.Values.OrderByDescending(m => m.CreatedAt).ToList();
    public Mission? GetMission(Guid id) => _missions.GetValueOrDefault(id);
    public bool DeleteMission(Guid id) => _missions.TryRemove(id, out _);

    public Mission? UpdateMission(Guid id, CreateMissionRequest req)
    {
        if (!_missions.TryGetValue(id, out var mission)) return null;
        mission.Name = req.Name;
        mission.MainApiUrl = req.MainApiUrl.TrimEnd('/');
        mission.DevApiUrl = req.DevApiUrl.TrimEnd('/');
        return mission;
    }

    public IgnoreRule? AddIgnoreRule(Guid missionId, AddIgnoreRuleRequest req)
    {
        if (!_missions.TryGetValue(missionId, out var mission)) return null;
        var rule = new IgnoreRule
        {
            Pattern = req.Pattern,
            Replacement = req.Replacement,
            Description = req.Description
        };
        mission.IgnoreRules.Add(rule);
        return rule;
    }

    public bool RemoveIgnoreRule(Guid missionId, Guid ruleId)
    {
        if (!_missions.TryGetValue(missionId, out var mission)) return false;
        return mission.IgnoreRules.RemoveAll(r => r.Id == ruleId) > 0;
    }

    public void AddLog(TrafficLog log) => _logs[log.Id] = log;

    public List<TrafficLog> GetLogs(Guid missionId) =>
        _logs.Values.Where(l => l.MissionId == missionId).OrderByDescending(l => l.Timestamp).ToList();

    public TrafficLog? GetLog(Guid id) => _logs.GetValueOrDefault(id);

    public List<TrafficLog> ExportLogs(Guid missionId) => GetLogs(missionId);

    public int ImportLogs(Guid missionId, List<TrafficLog> logs)
    {
        if (!_missions.ContainsKey(missionId)) return 0;
        foreach (var log in logs)
        {
            log.Id = Guid.NewGuid();
            log.MissionId = missionId;
            _logs[log.Id] = log;
        }
        return logs.Count;
    }
}
