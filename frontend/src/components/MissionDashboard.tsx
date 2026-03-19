import { useEffect, useState } from 'react';
import type { Mission, TrafficLog } from '../api/client';
import { api } from '../api/client';
import LogDetail from './LogDetail';
import IgnoreRulesPanel from './IgnoreRulesPanel';

interface Props {
  missionId: string;
  onBack: () => void;
}

export default function MissionDashboard({ missionId, onBack }: Props) {
  const [mission, setMission] = useState<Mission | null>(null);
  const [logs, setLogs] = useState<TrafficLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<TrafficLog | null>(null);
  const [tab, setTab] = useState<'logs' | 'rules'>('logs');
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const [m, l] = await Promise.all([
      api.getMission(missionId),
      api.getLogs(missionId),
    ]);
    setMission(m);
    setLogs(l);
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [missionId]);

  const handleReplay = async (logId: string) => {
    try {
      const newLog = await api.replay(logId);
      setLogs(prev => [newLog, ...prev]);
    } catch (err) {
      alert('Replay failed: ' + err);
    }
  };

  const handleExport = async () => {
    const data = await api.exportLogs(missionId);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mission?.name || 'export'}-traffic.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      const data = JSON.parse(text);
      const result = await api.importLogs(missionId, data);
      alert(`Imported ${result.imported} logs`);
      refresh();
    };
    input.click();
  };

  if (loading) return <div className="empty">Loading...</div>;
  if (!mission) return <div className="empty">Mission not found</div>;

  if (selectedLog) {
    return (
      <LogDetail
        log={selectedLog}
        onBack={() => setSelectedLog(null)}
        onReplay={() => handleReplay(selectedLog.id)}
      />
    );
  }

  return (
    <div>
      <div className="toolbar">
        <button className="secondary" onClick={onBack}>Back</button>
        <h2>{mission.name}</h2>
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 32, fontSize: '0.85rem', color: 'var(--text2)' }}>
          <div><strong>Main:</strong> {mission.mainApiUrl}</div>
          <div><strong>Dev:</strong> {mission.devApiUrl}</div>
          <div><strong>Proxy:</strong> http://localhost:5000/proxy/{mission.id}/...</div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'logs' ? 'active' : ''}`} onClick={() => setTab('logs')}>
          Traffic Logs ({logs.length})
        </button>
        <button className={`tab ${tab === 'rules' ? 'active' : ''}`} onClick={() => setTab('rules')}>
          Ignore Rules ({mission.ignoreRules.length})
        </button>
      </div>

      {tab === 'logs' && (
        <div>
          <div className="toolbar">
            <button className="secondary small" onClick={() => refresh()}>Refresh</button>
            <button className="secondary small" onClick={handleExport}>Export</button>
            <button className="secondary small" onClick={handleImport}>Import</button>
          </div>
          {logs.length === 0 ? (
            <div className="empty">
              No traffic captured yet. Send requests to the proxy endpoint above.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Method</th>
                  <th>Path</th>
                  <th>Main Status</th>
                  <th>Dev Status</th>
                  <th>Match</th>
                  <th>Latency</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} onClick={() => setSelectedLog(log)}>
                    <td style={{ fontSize: '0.8rem' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td><span className="badge method">{log.request.method}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      /{log.request.path}
                    </td>
                    <td>
                      <span className={`status-dot ${log.mainResponse.statusCode >= 200 && log.mainResponse.statusCode < 400 ? 'ok' : 'err'}`} />
                      {log.mainResponse.statusCode}
                    </td>
                    <td>
                      <span className={`status-dot ${log.devResponse.statusCode >= 200 && log.devResponse.statusCode < 400 ? 'ok' : 'err'}`} />
                      {log.devResponse.statusCode}
                    </td>
                    <td>
                      {log.comparison.statusMatch && log.comparison.bodyMatch ? (
                        <span className="badge match">Match</span>
                      ) : (
                        <span className="badge diff">{log.comparison.differences.length} diffs</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {log.mainResponse.latencyMs}ms / {log.devResponse.latencyMs}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'rules' && (
        <IgnoreRulesPanel missionId={missionId} rules={mission.ignoreRules} onUpdate={refresh} />
      )}
    </div>
  );
}
